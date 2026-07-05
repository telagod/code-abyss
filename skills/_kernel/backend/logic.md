# Logic — what good backend design actually is

One test governs everything here: **is change still cheap and safe a year from now?**
Good logic design is not elegance — it is invariants made explicit, so the next edit
(by a weaker model, a new hire, or you at 3am) cannot silently break them.

## 1 · Data model first, behavior second

Design entities, relationships, and invariants before endpoints and classes. Get the
data model right and the code writes itself; get it wrong and no architecture saves you.
Concretely, before implementing a feature write down: (a) the entities it touches,
(b) the invariants that must hold, (c) the legal state transitions. Then code.

> ✅ "An order: cart_id, state ∈ {draft, placed, paid, shipped, cancelled}; paid ⇒
> payment_id NOT NULL." The endpoints fall out mechanically.
> ❌ Starting from the controller, and discovering at PR #40 that "cancelled but paid"
> exists in production and nobody knows what it means.

## 2 · Boundaries follow data ownership; I/O stays at the edges

A module owns its tables and exposes verbs (`reserve_stock()`), not its data
(`UPDATE stock SET …` from three other modules). The domain core takes values and
returns values/decisions; HTTP, SQL, and queues live in a thin shell around it.
**Cheap test:** can you exercise the business rule in a unit test with no database and
no mock server? If not, the logic is welded to its transport.

> ✅ `price_quote(cart, rules) -> Quote` is pure; the handler fetches, calls, persists.
> ❌ Discount logic split across an ORM hook, a serializer, and a controller — testable
> only by booting the framework and seeding a database.

## 3 · Make illegal states unrepresentable

State machines over boolean flags: one `state` enum plus an explicit transition table
beats `is_active`/`is_deleted`/`is_pending` combinatorics (three booleans = 8 states, of
which 3 are legal and 5 are future incidents). **Parse, don't validate:** convert raw
input into a typed value once at the boundary; interior code never re-parses or
re-validates raw input — invariant assertions that crash on violation (§4's "bug"
bucket) are required guards, not re-checking.

After writing the transition table, audit it: every non-terminal state needs its exits
enumerated — including the human ones (cancel, void, expire, write-off); a state that
can only be left by editing the database is an illegal state you made representable.
And every enum value must be reachable by some legal transition — an unreachable value
is a feature you half-built.

> ✅ `transition(order, PLACED→PAID)` rejects every move not in the table.
> ❌ `if user.is_deleted and user.is_active:` — both true. Now what?

## 4 · Errors are designed, not appended

For every operation, enumerate the failure modes and sort each into exactly one bucket:
**retryable** (transient — safe to retry), **caller-fixable** (reject with a reason,
4xx-class), **bug** (crash loudly, page someone), **needs-human** (park it, alert).
Every error is handled exactly once — swallowing (`catch {}`) and double-logging both
lie to operators. The error path runs rarely but runs during incidents; it must be the
best-written code in the system, not the leftover.

> ✅ Payment timeout → retry with the same idempotency key; card declined → 402 to the
> caller; a negative amount reaching the charger → crash: that's an upstream bug.
> ❌ `try { charge() } catch (e) { log.warn(e) }` — and the order ships unpaid.

## 5 · Idempotency is the default for every cross-boundary mutation

Everything gets retried: clients retry timeouts, queues redeliver, humans double-click.
Any handler that mutates must be safe to run twice — idempotency keys on
POST-with-effects, upserts over inserts, state transitions that no-op on replay.
At-least-once delivery + dedup beats exactly-once fantasies — and **the dedup record
commits in the SAME transaction as the effects it guards**; a marker committed before
the work turns redelivery into silent event loss.

Outbound side effects on providers WITHOUT idempotency keys force a documented choice:
**at-least-once** (commit durable intent BEFORE the call; duplicates possible — fine
for email) vs **at-most-once** (commit after; misses possible). Anything money-shaped
gets at-least-once plus the provider's idempotency key. A DB-side claim row alone never
gives exactly-once — the crash-recovery path is where the duplicate is reborn.

> ✅ `POST /charge` with `Idempotency-Key` — the second call returns the first result.
> ❌ Timeout lands between the charge and the response → client retries → double charge.
> This one bug funds entire consultancies.
> ❌ Webhook marked processed in one transaction, effects applied in a second — a crash
> between them loses the event forever, while every retry gets a clean 200.

## 6 · Time and concurrency are load-bearing, not edge cases

Two requests WILL interleave; the process WILL die mid-function. Transactions delimit
invariants (`data.md` §4); read-modify-write needs `SELECT … FOR UPDATE` or a version
column; background work resumes from its last durable state; wall-clock time is an
input you inject, not an ambient global — and it skews across machines.
Hidden read-modify-writes to hunt in any schema: per-tenant sequence numbers
(invoice/order numbers), counters, "next available" anything — each needs a counter row
under `FOR UPDATE`, a DB sequence, or an insert-retry loop, chosen explicitly.

> ✅ `UPDATE accounts SET balance = balance - 100 WHERE id = ? AND balance >= 100` —
> the database enforces the invariant atomically.
> ❌ Read balance → check in app code → write new balance. Two concurrent withdrawals
> both pass the check.

## 7 · Explicit beats clever — the 3-jump rule

Code is read during incidents. From an endpoint to its effect (the SQL, the outbound
call), a reader should traverse at most ~3 files/indirections. Metaprogramming,
decorator stacks, DI magic, and convention-over-configuration all defer reading cost to
the worst possible moment. Greppability is an architectural property: a string seen in
a log must lead to exactly one place in the code.

## 8 · Duplication is cheaper than the wrong abstraction

Abstract on the third occurrence (rule of three), and only over domain concepts —
things the business has a name for — never over incidental similarity (two endpoints
that happen to look alike today and will diverge next sprint). Un-abstracting later
costs far more than un-duplicating.

## 9 · API contracts — the exported surface of all the above

Contracts evolve additively: add fields, never repurpose them; version when you must
break. Pagination on every list endpoint from day one (retrofitting it is a breaking
change). One consistent error envelope. No N+1 endpoint designs — a screen needs 1–3
calls, not 30. Each mutating endpoint's idempotency behavior is part of the documented
contract (`§5`).
