# Design — proposing, structuring, and evaluating approaches

## 1 · Mine the requirement behind the ask

Before implementing what was asked, state (one sentence) the problem the asker is actually
solving. Design to that; the literal ask is one candidate solution, not the spec.

> ✅ The user asked (in effect): use skill mode, the current layout is messy, this has to
> be handed to other people. The requirement was *portability*. The design answer was one
> self-contained folder + relative references + an install script; "make it a skill" was
> only part of it.
> ❌ Mechanically converting every doctrine file into its own skill would have satisfied
> the literal words and made distribution worse (N things to copy instead of one).

## 2 · Decompose a proposal by its load-bearing mechanism

To evaluate any proposal (including the user's), name the mechanism it relies on, then
check where that mechanism actually holds. Adopt it there; refuse it where it doesn't.
"Partially — and here is the split" is usually the right answer, and you must show the split.

> ✅ Skill-mode's mechanism is *load-on-recognition*. That fits task-shaped procedures
> (delegating, maintaining). It's fatal for always-on rules, because the failure being
> guarded against is precisely *failing to recognize the moment* — those must be
> force-loaded via CLAUDE.md. Result: hybrid, with the reasoning stated.
> ❌ Whole-proposal verdicts — "great idea, converting everything" or "no, CLAUDE.md is
> fine" — both miss that the mechanism fits half the content.

## 3 · One source of truth; pointers everywhere else

Every fact/rule lives in exactly one file; everything else points to it. Copies WILL drift,
and a weaker reader follows whichever copy it read last. When you find near-duplicates,
flag them and merge when you're next editing that material — after finishing the user's
live ask, and, for governance/rule files, under the owning bundle's maintenance protocol
(`doctrine/04`: removing or reversing a rule needs the user's OK first).

> ✅ SKILL.md files in this repo are routers: triggers + pointers, with an explicit rule
> that rule-text duplicated into them is drift to collapse.
> ❌ The pre-founding setup stated the same 5 rules in three places; the diagnosis file
> calls this out as "drift waiting to contradict itself".

## 4 · Degradation-safe: design for each part being absent

For every component, ask "what happens when this is missing/stale?" and make the answer
non-catastrophic. Provide the fallback in the design itself, not in your memory of it.

> ✅ The router names the `doctrine` skill AND the literal fallback path ("if the skill
> isn't in your list, Read ~/.claude/skills/doctrine/SKILL.md — same content").
> ❌ A router that only says "invoke the doctrine skill" bricks the whole institution the
> day skill registration changes.

## 5 · No unobservable triggers

Any rule or automation that fires on a condition nobody can check ("monthly", "when things
get messy", "keep it high quality") will never fire. Rewrite the trigger as a check a
stateless session can actually run.

> ✅ "Audit monthly" became "when about to edit the bundle, if the last git commit date is
> >30 days old, audit first" — statelessly checkable, self-stamping.
> ❌ "Roughly monthly, at a natural idle moment" — sessions are stateless; this fired never.

## 6 · Second-order check: what does this fix newly break?

Every fix/feature creates a new state of the world. Before shipping, ask what that new
state enables that the old one didn't — especially where the fix touches the same mechanism
that made the original bug possible.

> ✅ Fix: "on reinstall, move the old copy aside instead of failing." Second-order check
> caught that the moved-aside copy still contained a SKILL.md *inside skills/* — it would
> register as a phantom duplicate skill. The aside location moved outside `skills/`.
> ❌ Shipping the mv-aside fix after only re-running the original failing case — the
> phantom-skill regression passes that test and ships.

## 7 · Write for the weakest operator who must run it

If a weaker model (or a tired human) will execute the design, every branch needs exact
commands and a decidable branch condition. "Handle both cases appropriately" is not a design.

> ✅ Maintenance dual-mode: "run `readlink -f ~/.claude/skills/doctrine`; symlink into a
> repo → link mode, exact git commands follow; plain directory → copy mode, exact backup
> commands follow." The mode test is one command with an unambiguous result.
> ❌ "Use git if available, otherwise back up first" — not decidable ("available where?"),
> no commands, the weak operator guesses.
