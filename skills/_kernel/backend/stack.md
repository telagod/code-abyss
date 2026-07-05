# Stack — choosing technology by scenario, not ideology

The stack question is never "which is best". It is **"which failure can we afford"**. A
technology choice is a bet about the team, the load, and the next three years — made
under uncertainty, paid back in maintenance. Interrogate the scenario before naming any
tech; a stack named before the interrogation is ideology.

## 1 · The interrogation — no stack answer before these seven are answered

1. **Load, honestly:** requests/sec now, and ×10 if wildly successful. (Most backends
   never see 100 RPS; one Postgres + one boring app server covers 1–1000 RPS.)
2. **Data shape:** relational entities? documents? time-series? blobs? — and read:write ratio.
3. **Consistency:** where do money/inventory live (transactions required) vs feeds/counters
   (eventual is fine)?
4. **Latency budget:** human-facing (200ms p50 is fine) / machine-facing (p99 is a
   contract) / batch (throughput only)?
5. **Team:** who maintains this in year 2 — current skills, size, hiring pool. Code
   outlives its author. A stack someone PROPOSES is not a stack the team OPERATES: when
   members disagree, demonstrated production experience wins (§6's 3am test is the
   tie-breaker), and an unproven preference is a novelty-budget request, not a skill.
6. **Month-3 ecosystem needs:** auth, payments, PDFs, ML, that one obscure protocol —
   the library you'll need but haven't thought about yet.
7. **Lifetime:** throwaway prototype / growing product / system of record?

If the answers don't exist, ASK the user — stack choice binds hiring and budget; it is
their spend decision (`doctrine/02-judgment.md`), not your aesthetic one. If you cannot
ask (one-shot brief, no user in the loop), label every guess ASSUMED inline where it is
used, and close the interrogation with the list of ASSUMEDs that would flip the ruling
if they turn out wrong.

## 2 · The two-axis rule

Axes: raw performance · iteration speed · maintainability · ecosystem depth ·
operational burden · hiring pool. Any stack choice optimizes AT MOST TWO. State your two
in one sentence and name what you're paying on the others. A proposal that claims to win
on everything is an advertisement, not an analysis.

## 3 · Anti-ideology: the two named diseases

- **Performance-ism ("performance → Rust").** ~90% of web backends are I/O-bound: the
  bottleneck is the database and the network, where language runtime speed is noise.
  Identify the bottleneck CLASS first. Rust is right when: CPU-bound hot paths, hard
  p99 < 10ms, memory-constrained targets, or systems/infra software with a stable spec.
  Its price: iteration speed, hiring pool, and a compile-and-refactor tax on every
  future change.
  > ✅ A log-ingestion parser pushing 500MB/s per node → Rust earns its keep.
  > ❌ A CRUD SaaS at 30 RPS "in Rust for performance" — the DB was the bottleneck;
  > you bought pain, not speed.
- **Delivery-ism ("fast delivery → Next.js is the backend").** API routes are an escape
  hatch, not a backend. The moment you need background jobs, queues, websockets, cron,
  or multi-step transactions, you bolt workers onto a frontend framework and get an
  accidental distributed system. Rule: **if the system has background jobs, queues,
  cron, websockets, or multi-step transactions, it gets its own backend process from
  day one** — a status column on a row is not this trigger; a state machine advanced by
  background work is.
  > ✅ Marketing site + contact form + Stripe checkout → Next.js alone is honest.
  > ❌ A marketplace with payouts, matching, and digest emails living in API routes
  > plus four platform-cron hacks.

## 4 · Boring defaults (deviate only with a named, measured reason)

**The novelty budget:** one innovation token per system. Spend it where the product
differentiates — never on plumbing.

| Scenario | Default | Deviate when |
|---|---|---|
| CRUD / SaaS / internal API | Go, TypeScript(Node), or Python — whichever the TEAM knows; a modular monolith | genuinely polyglot team → pick by ecosystem fit |
| Data/ML-adjacent product | Python (ecosystem gravity is decisive) | extract measured hot paths later |
| Network-heavy infra, high-fanout services | Go | hard latency tails / memory ceilings → Rust |
| CPU-bound, systems, embedded | Rust (accept the iteration cost) | — |
| Deep domain complexity, big teams | JVM or C# (refactoring tooling, maturity) | — |
| Database | Postgres | proven need only: OLAP → ClickHouse; heavy search → try `pg` full-text first, then ES; time-series at scale → Timescale/ClickHouse; blobs → object storage |
| Cache | none until a measurement demands it | then Redis, cache-aside + TTL (`data.md` §6) |
| Queue / jobs | a Postgres table + a worker loop (`SKIP LOCKED`) | >~1k jobs/sec sustained or measured DB contention → Redis/SQS (competing workers, no replay); multiple independent consumers or history replay → Kafka or Redis Streams |
| Deploy | one process type on a PaaS/VM (containers fine) | k8s only when you already run ~5+ independently deployed services AND someone owns ops full-time |

## 5 · Microservices are an org chart, not an architecture

Split services when teams block each other's deploys, or when two domains have truly
divergent scaling/availability needs — never for "clean architecture". Every split buys
you network failure modes, versioned contracts, distributed debugging, and a standing
ops tax. A monolith with clean internal modules can be split later along its seams; a
distributed monolith — services sharing a database, deploying in lockstep, chatting
synchronously — is the worst point in the entire design space (`rot.md` §A1).

## 6 · Rewrites and adoptions

- Working-but-ugly system → **strangler pattern** (new code siphons traffic path by
  path), never big-bang rewrite. A rewrite resets the rot clock to zero AND discards
  years of edge cases encoded nowhere else.
- Adopting new tech requires 2 of 3: it solves a pain you MEASURED; it is >3 years old
  with a living community; someone on the team has run it in production.
- The strongest stack signal there is: **what can this team debug at 3am?** A "worse"
  technology the team knows deeply beats a "better" one nobody can operate.
