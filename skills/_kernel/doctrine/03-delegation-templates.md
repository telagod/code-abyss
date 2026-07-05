# 03 · Delegation templates — fill in the blanks, don't improvise

> Companion to `01-model-dispatch.md`. Every template carries the dispatch triple
> (goal+motive / acceptance criteria / report format). Replace `{...}` blanks; delete
> optional lines you don't need; keep the REPORT block verbatim — it's what protects
> your context. Send via the `Agent` tool with the noted `subagent_type` and `model`.

**Universal rules for every dispatch:**
- The subagent starts with ZERO of your context. Name absolute paths, exact symbols, and the project root.
- If the expected output is long, instruct: "write it to `{path under the session scratchpad or repo}`
  and return only the path + a 3-line summary."
- Tell it the Bash empty-flush rule if its task depends on command output:
  "If a Bash result comes back empty unexpectedly, redirect to a file and Read it — do not trust empty."

---

## 1 · SEARCH — "where is X / does X exist / how does X work here"

Agent: `subagent_type: "Explore"` (read-only is a feature) · Model: `haiku` for exact-string hunts, `sonnet` when the query is conceptual.

```
GOAL: Find {what} in {repo/dir absolute path}.
WHY: {what decision this feeds — e.g. "we're adding a new role and need every auth gate that must learn about it"}.
SEARCH BREADTH: {medium | very thorough — thorough means multiple naming conventions and locations}.
ACCEPTANCE: Every match is listed, or you explicitly state the search strategies you exhausted.
  A "not found" answer must name at least 3 distinct strategies tried (literal grep, synonyms, callers/imports).
REPORT: Conclusion in the first sentence. Then a list: `file:line` + one line on what's there.
  No file bodies, no narration. If >20 matches, write the full list to {scratchpad path} and return the path + the 5 most important.
```

## 2 · IMPLEMENT — "build/add/fix this specific thing"

Agent: `general-purpose` · Model: `sonnet` default; `opus` if the change is cross-cutting or correctness-critical.

```
GOAL: Implement {what} in {files/module, absolute paths}.
WHY: {user-visible motive — lets the agent make the small calls you didn't foresee}.
CONSTRAINTS: Match the surrounding code's style, naming, and error-handling. No new deps unless listed here: {deps or "none"}.
KNOWN CONTEXT: {everything you already know: relevant files, the root cause if diagnosed, approaches already ruled out}.
ACCEPTANCE: {concrete, checkable — e.g. "`npm test` passes including a NEW test for {behavior}; the flag appears in --help output"}.
  Run the verification yourself before reporting. "I wrote the code" does not meet acceptance.
REPORT: First sentence: done or blocked. Then: files changed as `file:line` ranges, what the verification
  showed (paste the test-run tail, ≤10 lines), and any risk you noticed. If blocked: what you tried and the exact error.
```

## 3 · REFACTOR / BATCH-EDIT — "apply this known pattern across N places"

Agent: `general-purpose` · Model: `haiku` if the pattern is fully specified below; `sonnet` if any site needs judgment.
For parallel agents editing the same repo, add `isolation: "worktree"` or shard by directory so they don't collide.

```
GOAL: Apply this exact transformation: {before → after, with a real example from the codebase}.
SITES: {explicit file list, or the exact command that enumerates them}.
WHY: {motive}.
DO NOT: change behavior, reorder unrelated code, "improve" things outside the pattern, or touch files not in SITES.
EDGE RULE: If a site doesn't cleanly match the pattern, SKIP it and list it in the report — do not improvise a variant.
ACCEPTANCE: Every site either transformed or listed as skipped-with-reason. {build/test command} still passes.
REPORT: Counts first ("N transformed, M skipped"). Then skipped sites as `file:line` + reason.
  Then the verification result. No diffs in the reply — I'll read the files if needed.
```

## 4 · RESEARCH — "find out X from the web/docs"

Agent: `general-purpose` · Model: `sonnet`. Tools: WebSearch/WebFetch, plus `mcp__exa__*` if available (load via ToolSearch).

```
GOAL: Answer: {precise question}.
WHY: {the decision this feeds — so the agent knows which details matter}.
SOURCES: Prefer {official docs / changelog / source code} over blogs. Note the publish date of anything time-sensitive.
ACCEPTANCE: Every load-bearing claim has a URL. Conflicting sources are surfaced, not silently resolved.
  If the answer can't be established, say so — an honest "unclear, here's the state of evidence" passes; a guess fails.
REPORT: The answer in ≤3 sentences first. Then claims with citations. Write anything longer than ~30 lines
  to {scratchpad path} and return the path.
```

## 5 · REVIEW / VERIFY — "check this work with fresh eyes"

Agent: `general-purpose` (fresh context is the point — never the agent that did the work) · Model: `sonnet`; `opus` for high-stakes.
For code diffs, prefer the `code-review` skill; use this template for everything else (files, plans, claims).

```
GOAL: Adversarially review {the artifact: file path / claim / plan}. Your job is to find what's WRONG, not to approve.
CONTEXT: It claims to {what it's supposed to do}. It was produced to satisfy: {original acceptance criteria}.
CHECK SPECIFICALLY: {the 2–4 failure modes you're most worried about — e.g. "rules that contradict each other",
  "paths/commands that don't exist — run them", "edge case: empty input"}.
METHOD: Verify claims by execution where possible (run the command, Read the file, trigger the path), not by plausibility.
ACCEPTANCE: Every CHECK item has a verdict: PASS (with the evidence you saw) or FAIL (with `file:line` and the concrete failure scenario).
REPORT: Verdict first ("N issues, worst is X" or "clean"). Then findings ranked by severity, each with
  `file:line`, one-sentence defect, one-sentence failure scenario. No restating what's fine.
```

---

## Escalation dispatch (when a sub-task failed twice — see `01` ladder)

When escalating to `opus`, the failure trace IS the payload. Minimum contents:
what the goal was · attempt 1 (approach + exact error/output) · attempt 2 (ditto) ·
what this rules out · the current hypothesis, if any. An escalation without the trace
just makes the stronger model repeat the dead ends at higher cost.
