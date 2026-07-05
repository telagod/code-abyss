# Operate — production-grade is a design property, not a deployment step

A backend that works but cannot be observed, configured, or safely deployed is not
done — it is an incident scheduled for later. These are floors, not aspirations.

## 1 · The 3am test (observability)

From logs and metrics alone, an operator who didn't write the code must be able to
answer: "what happened to request X?" Concretely: structured logs (JSON); one
request/correlation ID minted at the edge and threaded through every log line, job, and
downstream call; log the decision points ("declined: limit exceeded"), not line-number
breadcrumbs. Metrics: RED per endpoint — rate, errors, duration (p50/p99). Traces once
more than one service exists.

> ✅ `grep req_7f3a` tells a story: authenticated → rate-limited → retried → 402.
> ❌ "Payment failed" ×3000/day with no IDs, no amounts, no correlation. Debugging is
> now archaeology.

## 2 · Fail at boot, not at first use

Config comes from the environment and is validated completely at startup — a missing
secret kills the process with a named error before it serves one request, not at the
first payment three hours in. Secrets never in code, git, or logs. One artifact runs in
every environment; only config differs.

## 3 · Every external call gets a timeout, a retry policy, and a budget

No infinite defaults — most HTTP clients ship with none; set one on every call.
Timeouts sized to the caller's own budget (an edge with a 2s budget can't wait 30s on a
dependency). Retries: exponential backoff + jitter, bounded, and ONLY on idempotent
operations (`logic.md` §5). A slow dependency must degrade one feature, not freeze the
fleet — when one request fans out to 3+ downstream calls, or a single dependency sits
on the path of most endpoints, cap its concurrent calls with a bounded pool (bulkhead)
or a circuit breaker; below that, per-call timeouts suffice. Graceful shutdown: stop
accepting, drain in-flight, then exit — otherwise every deploy is a micro-outage.

## 4 · Deploys are reversible; migrations are decoupled

Rollback beats fix-forward at 3am — keep the previous artifact one command away. Schema
changes follow expand/contract (`data.md` §5) so old and new code coexist during the
roll. Risky paths sit behind flags you can flip without deploying. If deploys need a
wiki ritual, a specific person, or a window, change has already become scary
(`rot.md` §E21).

## 5 · Security floor — all of them, non-negotiable

Parameterized queries only (string-built SQL is an incident, not a style) ·
authorization checked **per object**, not per endpoint — `/orders/123` must verify 123
is YOURS; object-level misses (IDOR) are the most common real-world hole · every input
validated AND size-limited at the boundary (body size, array length, string length) ·
passwords → argon2/bcrypt, never homemade · least privilege for DB users (the app user
cannot DROP) · dependencies patched as routine, not as crisis · never roll your own
crypto, auth, or session management.

## 6 · Background jobs are first-class citizens

Every job is: **resumable** (crash mid-run corrupts nothing; the next run continues from
durable state), **observable** (last-success time and failure count visible; alert when
stale), **killable** (respects shutdown), and **rate-aware** (a backfill that saturates
the DB takes the site down as effectively as a DDoS — throttle it).

## 7 · Limits everywhere

Rate limits at the edge (per user / IP / API key); quotas on expensive operations;
maximum page sizes; queue depth bounds with backpressure. An unbounded queue converts
today's overload into an out-of-memory crash two hours later — much harder to diagnose
than a fast, honest 429.
