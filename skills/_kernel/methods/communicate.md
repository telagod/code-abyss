# Communicate — writing that someone else must act on

## 1 · A rule = observable trigger + action + one right example + one wrong example

Abstract exhortations ("be careful with X", "keep quality high") transfer nothing. If the
reader can't check whether the trigger fired, or can't picture the wrong behavior, the rule
doesn't exist. Numbers beat adjectives: "~50 lines", "2 rounds", ">30 days" — not "large",
"a few", "stale".

> ✅ "Never retry the same command more than once on empty output; on the second empty,
> switch to write-then-Read" — a countable trigger and an exact alternative action.
> ❌ "Don't over-rely on retries" — how many is over? Doing what instead?

## 2 · Lead with the outcome; anomalies go in the report, not under it

First sentence answers "what happened / what did you find". Surprises, failures, and things
you broke go in the main body, stated plainly, with what you did about them — even when
embarrassing. Burying an anomaly converts your reader's trust into a time bomb.

> ✅ "Confirmed lost: the 2026-07-03 backup vanished from disk mid-session (not my
> deletion). I reconstructed it from context; note left in the directory." — reported to
> the user in the moment, prominently.
> ❌ A ten-line summary of successes with the vanished backup mentioned nowhere — the user
> discovers it months later with zero explanation attached.

## 3 · Write for the weakest reader who must act on it

Spell out terms; give absolute paths and exact commands; never rely on shorthand you
invented mid-document or on context the reader won't have. If a sentence has two readings,
a weaker reader takes the wrong one — rewrite until it has one.

> ✅ "Skills must sit at exactly `~/.claude/skills/<name>/SKILL.md` — an extra nesting
> level (e.g. `skills/local/<name>/`) silently prevents registration."
> ❌ "Put skills in the usual place" — the author knows the usual place; the reader's
> "usual" is whatever they saw last, which is how `skills/local/` happened.

## 4 · Split by audience: rules for models, prose for humans, one language each

Model-facing instruction files: English (weaker models follow English instructions most
reliably). Human-facing docs: the human's language. Never mix audiences in one file — a
document that half-addresses the model and half-addresses the user serves neither.

> ✅ This repo: doctrine/methods rule files in English; README in Chinese; the session
> converses with the user in Chinese while writing English rules.
> ❌ A README that alternates between "you (the model) must delegate" and "你可以把这套给
> 同事" — the model obeys instructions meant for the human and vice versa.

## 5 · Say what you *can't* do as precisely as what you can

Process buys back execution quality; it cannot buy taste or resolve genuinely ambiguous
asks. When you hit that limit, name it and hand over a decision package (options +
trade-offs), instead of dressing a guess as a recommendation. Stated uncertainty is
information; hidden uncertainty is a defect.

> ✅ "I can verify execution but not taste — here are the options and trade-offs, you
> pick." (Written into the doctrine as a *correct deliverable*, verbatim.)
> ❌ Confidently recommending architecture A over B when the real basis is a coin flip —
> the confidence, not the choice, is the lie.

## 6 · Documents that will outlive you need a maintenance surface

Anything meant to last must say how to change it: who may edit what, where updates go, what
format, when to compact. A living document without a maintenance protocol becomes either
frozen (stale) or a landfill (drift) — both kill trust in everything else it says.

> ✅ The doctrine ships `04-maintenance.md`: self-edit boundaries, exact commit commands,
> a compaction trigger with thresholds, and an update-annotation format.
> ❌ Shipping a beautiful rules file with no edit protocol — six months later three
> sessions have appended three conflicting versions of the same rule (this is drift **by
> accretion**, the documented #2 degradation mode).
