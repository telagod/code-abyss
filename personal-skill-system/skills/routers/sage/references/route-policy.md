# Route Policy / 路由策略

## 1. First Split By Intent

Classify the request into one of:

- knowledge
- execute
- validate
- orchestrate
- design
- release

## 2. Precedence

Use this order:

1. explicit skill name
2. workflow for action requests
3. tool for explicit checks
4. domain for advisory requests
5. guard only as an automatic gate

## 3. Common Conflicts

- `frontend-design` vs `architecture`
  UI/UX and interaction -> `frontend-design`
  API/boundary/dataflow -> `architecture`
- `investigate` vs `bugfix`
  uncertain cause -> `investigate`
  known defect with fix intent -> `bugfix`
- `orchestration` vs `multi-agent`
  conceptual coordination -> `orchestration`
  active parallel execution plan -> `multi-agent`

## 4. Import Guidance

- paste-only host: favor router + domains + workflows first
- folder-capable host: bring tools and guards with scripts
- if the host cannot execute scripts, tool skills degrade into policy/reference roles
