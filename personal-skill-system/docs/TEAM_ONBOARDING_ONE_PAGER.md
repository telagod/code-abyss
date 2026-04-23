# Team Onboarding One-Pager / 团队上手一页纸

## 0. What This System Is / 这套系统是什么

- Stable route surface + deep modular references.
- Public entry points stay small; depth is loaded only when required.
- Deterministic tools are for proof, not for replacing judgment.

## 1. Day-1 Checklist / 第一天清单

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
npm test -- test/personal_skill_system_tools.test.js --runInBand
```

Only start normal usage after both commands pass.

## 2. Default Route Policy / 默认路由策略

Pick only one primary skill first:

- `architecture`: business/system/technical boundaries
- `development`: implementation and refactor
- `investigate`: root-cause analysis
- `bugfix`: minimal safe repair
- `review`: findings-first risk review
- `chart-visualization`: G2/S2/infographic/T8 tasks

Then add tools only when proof is needed:

- `verify-change`
- `verify-quality`
- `verify-security`
- `verify-chart-spec`
- `verify-s2-config`

## 3. Prompt Skeleton / Prompt 骨架

```text
Use <primary-skill> for this task.
Goal: <one sentence outcome>
Context: <path/module/data>
Constraints: <minimal-change/safety/compatibility>
Deliverable: <code/config/doc/test>
Validation: <exact command(s)>
```

## 4. Chart Work Fast Path / 图表任务快链

1. Route to `chart-visualization`.
2. Decide semantics first (chart type, encoding, data meaning).
3. Produce runnable minimum spec/config.
4. Run deterministic checks when draft exists:
   - G2: `verify-chart-spec`
   - S2: `verify-s2-config`

## 5. Anti-Patterns / 禁忌动作

- Loading many peer skills before identifying one primary route.
- Using `verify-*` as a substitute for design decisions.
- Asking for “done” without executable validation commands.
- Doing visual polish before semantic correctness for chart tasks.

## 6. First References / 新人首读

- `docs/NEWCOMER_OPTIMAL_CALLING_GUIDE.md`
- `docs/SKILL_TRIGGER_CASEBOOK.md`
- `docs/ANTV_INTEGRATION_VERDICT_2026-04-20.md`
- `docs/MANUAL_IMPORT_GUIDE.md`
