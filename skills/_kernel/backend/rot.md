# Rot — garbage, disasters, and the early signs of the shit mountain (屎山)

The defining property of rot is not ugliness. **A codebase rots the moment changing it
stops being safe** — when feedback loops (tests, types, local runs, observability) decay,
every modification becomes a cautious append, and entropy compounds. Ugly-but-safe is
refactorable; pretty-but-unsafe is already dying. Every signal below is observable in
code or team behavior. Format: signal → why it's rot → fix.

## A · Architecture rot

1. **Distributed monolith.** Services sharing a database, deploying in lockstep, dying
   together through chatty synchronous chains. *Why:* all of microservices' costs, none
   of the autonomy. *Fix:* merge them back, or make ownership real — own data, async
   contracts.
2. **Layer-split services.** An "API service" + a "logic service" + a "database service".
   *Why:* every feature crosses every service; nobody owns anything end-to-end.
   *Fix:* split by domain (orders, billing) or don't split.
3. **Premature plumbing.** Kafka, k8s, service mesh before product-market fit. *Why:*
   innovation tokens spent on plumbing; ops tax without ops need (`stack.md` §4).
4. **Framework-welded logic.** Business rules living in ORM hooks, serializer callbacks,
   middleware side effects. *Why:* untestable without booting the world; invisible
   execution order. *Fix:* extract the pure core (`logic.md` §2).

## B · Logic rot — the earliest shit-mountain signals

5. **Boolean flag accretion.** `is_active`, `is_deleted`, `is_archived`, `is_pending` on
   one row; code checking three flags together. *Why:* 2ⁿ states, most illegal, all
   reachable. *Fix:* one state enum + transition table (`logic.md` §3). **This is the
   single most reliable early-warning signal.**
6. **Shotgun surgery.** A routine one-concept change touches 6+ files, every time.
   *Why:* boundaries don't match the domain; the cost of change is compounding.
7. **God module.** `utils.py` at 3000 lines; a `User` table with 60 columns; a "core"
   package everything imports. *Why:* every change collides there; conflicts and fear
   concentrate. *Fix:* split by owning concept; ban the name "utils" for new code.
8. **Pass-through layers.** controller → service → manager → repository, each merely
   forwarding. *Why:* four files per change, zero decisions per file. A layer earns its
   existence by making a decision, or dies.
9. **Temporal coupling.** `init()` must precede `process()` or things break silently.
   *Why:* neither compiler nor reader can see the dependency. *Fix:* the second function
   takes the first one's result as a parameter.
10. **Copy-paste divergence.** The same business rule in three places, already subtly
    different. *Why:* which is correct? Nobody knows — the behavior is now undefined.
    *Fix:* treat the copies as three specs to reconcile, not one to pick — diff them,
    find what each call site actually depends on (tests, logs, git history), then unify
    deliberately, noting any intentional behavior change.
11. **Load-bearing TODO.** `// TODO: fix properly` older than three months. *Why:* it IS
    the design now, just undocumented. *Fix:* do it, or replace it with a comment stating
    the real constraint.

## C · Data rot

12. **Constraint-free schema.** Everything nullable, no FKs, "for flexibility". *Why:*
    the inconsistent data already exists — you just haven't run the query that proves it;
    every reader pays defensive code forever (`data.md` §1).
13. **The growing blob.** A `metadata` JSON column that quietly became the real schema.
    *Why:* unqueryable, unvalidated, unmigratable. *Fix:* promote stable keys to columns.
14. **Magic values.** `status = 3`; `-1` means unknown; `""` means default. *Fix:* real
    enums / reference tables (`data.md` §3).
15. **Type lies.** Money in floats, naive timestamps, phone numbers as integers
    (`data.md` §3).
16. **Migration fear.** "Don't touch the schema — something might depend on it." *Why:*
    the schema is now append-only; every feature adds a parallel table; model and domain
    drift apart permanently.

## D · Reliability rot

17. **Swallowed errors.** `catch (e) {}` or log-and-continue wrapped around mutations.
    *Why:* the system lies about its own state; the incident surfaces days later as data
    corruption (`logic.md` §4).
18. **Retry without idempotency.** Double charges, duplicate emails (`logic.md` §5).
19. **No timeouts.** One slow dependency freezes every worker in the fleet (`operate.md` §3).
20. **Happy-path test suite.** High coverage, zero failure-mode tests. *Why:* the error
    paths first execute in production, during the exact incident they existed to prevent.

## E · Change rot — disaster leading-indicators (team behavior, not code)

21. **The deploy ritual.** Deploys need a wiki checklist, a specific person, a window.
    *Why:* when change is scary, change stops; entropy wins by default.
22. **Test theater.** Mocks all the way down (the tests test the mocks); flaky tests
    everyone re-runs until green. *Why:* trust = 0, so tests gate nothing — decoration.
23. **Environment drift.** "Works on staging"; nobody can run it locally. *Why:* the
    feedback loop's first rung is gone; every experiment now costs a deploy.
24. **Fear-driven appends.** New code only ever adds — another if-branch, another column,
    another copy of the function — because editing existing code breaks unknown things.
    **The definitive sign the mountain is forming:** deletion has become impossible, so
    entropy can only accumulate.
25. **Bus factor 1.** "Ask Zhang about the billing job." *Why:* knowledge in one head is
    one resignation away from nonexistence. *Fix:* the campsite rule
    (`methods/execute.md` §6) — decisions land in files, not heads.

## The meta-signal

One question sums a codebase's health: **"can a competent stranger safely make a small
change today?"** Every entry above is one way the answer turns into "no". And every fix
rebuilds the same thing — feedback loops: constraints that catch, tests that gate, logs
that explain, deploys that reverse. Rot is not entropy of style. It is the death of feedback.
