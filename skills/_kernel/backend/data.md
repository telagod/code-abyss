# Data — the layer that outlives all your code

Application code churns; the schema and the data outlive frameworks, rewrites, and
teams. Effort spent here compounds. Corners cut here compound too — as corruption.

## 1 · Constraints live in the database

`NOT NULL`, `FOREIGN KEY`, `UNIQUE`, `CHECK` — the database is the only guard shared by
every code path, including next year's migration script and someone's one-off console
session. "The app validates it" binds exactly one of those paths: today's. `CHECK`
covers cross-COLUMN logic, not just ranges — if an invariant fits inside one row, it
belongs in the table, not the app. Invariants spanning tables can't be CHECKed: enforce
them inside the one transaction that spans them (§4); reach for a trigger only when
untrusted write paths must be guarded, and document it in the schema file — triggers
are invisible to the code reader (`logic.md` §7).

> ✅ `amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0)` — survived three rewrites.
> ✅ `CHECK (status <> 'paid' OR paid_at IS NOT NULL)` ·
> `CHECK (total_cents = subtotal_cents + tax_cents)` — state-dependent columns and
> row arithmetic get CHECKs too.
> ❌ "Everything nullable for flexibility" — the inconsistent data already exists; you
> just haven't run the query that proves it.

## 2 · Facts stored once; derived data is labeled cache

Normalize until it hurts; denormalize only where a measurement demands it — and mark
every derived column/table as rebuildable, writing the rebuild script the same day.
A derived value nobody can recompute is a fact you can no longer trust.

> ✅ `invoice.total_cents` is recomputed from line items in the same transaction that
> edits them — or frozen by making line items immutable once the invoice leaves draft;
> either way the rebuild query is written the same day.
> ❌ Totals written at creation and edited independently ever after: two facts, one
> truth, zero ways to tell which.

## 3 · Types tell the truth

- **Money:** integer minor units (or `NUMERIC`). Float money is a firable offense.
- **Time:** `timestamptz`, UTC, always. A naive timestamp is a bug with a delay fuse.
- **Numeric-looking non-numbers** (phone, postal code): text.
- **Status:** real enum or a reference table — never magic ints (`-1` = "unknown" is how
  rot begins, `rot.md` §C14).
- **IDs:** no business meaning ever; `bigserial`/identity internally, UUIDv7/ULID when
  exposed or generated across machines.

## 4 · Transactions delimit invariants

One transaction = one invariant made atomic. Keep them short; never hold one across a
network call or user think-time. Read-modify-write is a lie without `FOR UPDATE` or a
version column. Know your isolation level: Postgres defaults to READ COMMITTED, which
is weaker than most people silently assume.

## 5 · Migrations: expand → migrate → contract

Every schema change must be compatible with BOTH the code version before it and after
it — deploys and migrations never land atomically. Sequence: add nullable → deploy code
that writes both → backfill → constrain → switch reads → drop old; each its own release
step. Destructive operations
(drops, type changes) ship one release AFTER the last code stopped using them. A
migration you fear is a schema that's already dead (`rot.md` §C16).

## 6 · A cache is a consistency bug you opted into

No cache until a measurement demands one. Then: cache-aside with a TTL as the default
shape; explicit invalidation only where a TTL provably can't work; never cache what's
cheap to compute; track the hit rate — an unmeasured cache is pure risk. Every cached
value must have an answer on file to: "how stale can this be before someone is harmed?"

## 7 · Queries earn their keep

Every list endpoint gets: pagination (keyset for any table with unbounded growth —
logs, events, orders — or already past ~100k rows; offset only for small bounded sets),
an index that matches the actual query, and a `LIMIT` even where "it can't be big". At
design time `EXPLAIN` doesn't exist yet: write each query's WHERE/ORDER BY beside its
proposed index and hand-check the leading columns — background jobs' sweeps are queries
too; `EXPLAIN` then confirms in development. N+1 is found by reading the query log in
development, not by intuition. The slow query log is on from day one, not after the
first outage.

## 8 · History where money and disputes live

Append-only audit (event table or temporal history) for payments, permissions, and
inventory — anywhere someone might one day ask "who changed this and when".
`created_at`/`updated_at` on everything. Soft-delete only where restore or audit
genuinely needs it: a `deleted_at` that every single query must remember to filter is a
permanent tax — consider an archive table instead.
