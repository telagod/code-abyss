# 01 · Model Dispatch — the commander does not go down onto the field

> For the main-loop model of every future session. This is the highest-leverage habit you have.
> Root problem it fixes: `00-diagnosis.md` #2 (heavy work run inline bloats and de-focuses the main context).

---

## The one rule everything else serves

**The main dialogue receives conclusions, not raw output.**

Your context window is the scarcest resource in the session. Anything that would dump raw bytes into it — repo scans, multi-file reads, web pages, batch-edit diffs — runs in a **subagent** whose only job is to hand you back the *conclusion*. You stay a decision surface, not a scratchpad.

---

## When to delegate (the trigger, concretely)

Delegate to a subagent when a task would do **any** of these:

- Dump **more than ~1 screenful (~50 lines) of raw text** into your context to extract a small answer. (grep across the repo, read 3+ substantial files, fetch a web page.) The ~50-line total is the real trigger; "3+ files" of a few lines each doesn't qualify.
- **Search when you're not confident the first try lands** — naming conventions, "where is X used", "does this pattern exist anywhere".
- **Fan out** — the same operation over many files/items (audit N modules, rename across the tree).
- **Research** — anything needing WebSearch/WebFetch and reading multiple sources.
- **Batch-edit** many files where you'd otherwise read each one inline.

Do **not** delegate when: you already know the exact file and line, it's a single small read/edit, or the round-trip overhead exceeds the work. Delegation has a real cost (~one extra turn); use it to save context, not to avoid a 3-line `Read`.

> Litmus test: *"Will the raw output of this be much bigger than the answer I need from it?"* Yes → delegate. No → do it inline.

---

## The dispatch triple — every delegation carries all three

A subagent starts with **zero** of your context. A vague prompt gets a vague, unusable answer. Every `Agent` dispatch MUST contain:

| Part | What it is | Why it's load-bearing |
|------|-----------|----------------------|
| **1. Goal + motive** | *What* you want and *why* you want it | The "why" lets the agent make the judgment calls you can't foresee. "Find auth checks" is worse than "Find auth checks because we're adding a new role and need every gate that must learn about it." |
| **2. Acceptance criteria** | How both of you know it's done — concrete, checkable | Without this the agent stops when *it* feels done, not when *you* need it done. "List every call site" not "look into the callers." |
| **3. Report format** | Exactly what to return, in what shape | Controls what re-enters your context. Specify "conclusion first, then `file:line` evidence, nothing else" or you get a wall of narration. |

If you can't write all three, you don't understand the task well enough to delegate it yet — scope it first.

Don't compose these from scratch each time — `03-delegation-templates.md` has fill-in-the-blank prompts
for the five common task shapes (search, implement, refactor, research, review).

---

## Which model for which job (real tiers in THIS environment)

The `Agent` tool's `model` field accepts exactly: **`haiku` · `sonnet` · `opus` · `fable`**. Pick explicitly — do not let it default when the job clearly wants a different tier.

| Model | Cost | Use it for | Do NOT use it for |
|-------|------|-----------|-------------------|
| **`haiku`** | cheapest | Mechanical/known-pattern work: apply a fix you already designed across N files, format/rename, collect-and-list, simple greps-and-report | Anything requiring judgment, ambiguity resolution, or correctness reasoning |
| **`sonnet`** | default workhorse | Most searches, implementation, straightforward review, doc generation | The hardest reasoning; adversarial verification of high-stakes claims |
| **`opus`** | expensive | Hard/ambiguous debugging, architecture trade-offs, adversarial review, judge panels, second opinions | Bulk mechanical work (waste); trivial lookups |
| **`fable`** | ceiling (Mythos-tier) | Only the single hardest correctness-critical judgment where `opus` genuinely isn't enough | Anything routine. Reserving it is the point — if you reach for it often, you're mis-scoping. |

**Availability caveat:** `fable` was available when this was written (2026-07-03) but the user's plan may
not include it later. If an Agent call with `model: "fable"` errors or silently downgrades, treat **`opus`
as the ceiling** and compensate with the multi-answer/judge patterns below instead of a bigger brain.
Also: agent *types* matter as much as model — use `Explore` for read-only fan-out searches (it can't edit,
which is a feature), `Plan` for implementation planning, `general-purpose`/`claude` for everything else.

**Effort / thinking depth.** The `Agent` tool has **no** `effort` parameter — you control a subagent's depth by (a) choosing a higher model tier and (b) telling it to reason step-by-step in the prompt. If your tool list includes `Workflow` (main session only; subagents never have it), its `agent()` takes `opts.effort` (`low`/`medium`/`high`/`xhigh`/`max`) — usable when orchestrating a script. The main session's own effort is set by the user (`/model`, and thinking keywords like "think"/"ultrathink"); you do not control it mid-turn.

---

## Escalation & de-escalation ladder

Retrying a model that just failed the *same* task usually fails the same way. Move tiers instead.

- **Small model errs once → escalate immediately.** A `haiku` agent that got it wrong does not get a second `haiku` attempt on the same task. Go up a tier.
- **Mid model fails the same sub-task twice → escalate to `opus`, and hand over the full failure trace** (what it tried, what broke, both outputs). Escalating without the trace makes the stronger model repeat the dead ends.
- **Pattern solved → de-escalate.** Once the hard part is cracked (you or `opus` found the fix/approach), hand the *repetitive application* back down to `haiku`/`sonnet`. Don't burn `opus` on 20 identical edits.
- **Hard cap: 2 escalation rounds on the same thing.** If two escalation rounds haven't cracked it, **stop retrying** — either change the approach entirely (see `02-judgment.md` → Rubric 4) or bring it to the user with what you've learned. A third blind retry is the failure state.
  (Two different counters, don't conflate: this cap counts *escalation rounds across model tiers*. `02` Rubric 4's "three variations" counts *attempts at the same approach* before you must switch approach.)

---

## Report contract — what a subagent hands back

The subagent's final message IS the data you receive; it is not shown to the user. Enforce this shape in every dispatch:

1. **Conclusion first.** The answer, in the first sentence. Not "I looked at several files and…".
2. **Evidence as `file:line`.** Point, don't paste. `src/auth.js:42` — not the 40 lines around it.
3. **Long artifacts go to a file.** A generated report/large diff/dump is *written to a file*; the agent returns the **path** + a 2-line summary. Never paste a 500-line artifact back into your context — that defeats the entire point of delegating.
4. **Blocked ≠ silent.** If it couldn't finish, it returns *what blocked it and what it tried*, not a vague "I couldn't do it."

When you write the dispatch, ask for exactly this. When you read the result, if you got narration instead, that's a prompt bug — tighten the report-format line next time.

---

## Verification does not self-certify

The agent that did the work is the **worst** judge of whether it's correct — it shares the blind spot that produced the error. Verify with **fresh context**:

- **File writes** → verify by **read-back**: a *different* agent (or you) `Read`s the file and confirms it landed with the intended content. "I wrote it" is not verification.
- **Code changes** → verify by **running it**: the test suite, or actually executing the path. Re-reading your own diff and declaring it correct is not verification — an agent will confidently claim "done/fixed" on code that doesn't run.
- **High-stakes judgment** (security finding, architecture call, anything hard to reverse) → **second opinion or multi-answer select**: spawn an *independent* agent to try to *refute* the conclusion, or generate N candidate answers and have a judge agent pick the best. Default the verifier to disbelief.

Rule of thumb: **the harder to reverse, the more independent the verification.** A doc typo needs a read-back; a production migration needs an adversarial reviewer who defaults to "this is wrong, prove me otherwise."

> The `Workflow` tool implements fan-out-then-adversarially-verify at scale (its own tool description
> carries the patterns: adversarial verify, judge panel, loop-until-dry). Reach for it when a fan-out task
> must produce *trustworthy* results (audit, review, research, migration) — but only when the user has
> opted into multi-agent orchestration; otherwise plain `Agent` calls. **Check your tool list first:**
> `Workflow` exists in the main session only; if you don't see it (you may be a subagent, or the harness
> changed), do NOT try to call it — fan out with multiple `Agent` calls in one message instead. For code
> specifically, the `code-review` and `verify` skills already package verification — prefer them over
> hand-rolling.

---

## Quick reference (paste-ready mental model)

```
Would raw output ≫ the answer?           → delegate
Every dispatch: goal+motive / accept / report-format
Model:  mechanical→haiku  default→sonnet  hard→opus  hardest→fable
Fail:   small errs once→up   mid fails 2×→opus+trace   solved→down   2 rounds max
Report: conclusion first · file:line · big artifact→file+path · blocked→say why
Verify: fresh context · read-back files · run code · refute high-stakes
```
