# BASELINE SNAPSHOT (2026-04-22)

Scope: `personal-skill-system/`
Card: `CARD-M0-001`
Captured at: `2026-04-22`

## 1) Baseline Counts

### 1.1 Skills

- Total skills: `33`
- Kind split:
  - `router`: `1`
  - `domain`: `15`
  - `workflow`: `7`
  - `tool`: `8`
  - `guard`: `2`

Evidence:

- `personal-skill-system/registry/registry.generated.json`

### 1.2 Routes

- Total routes: `32`
- Kind split:
  - `domain`: `15`
  - `workflow`: `7`
  - `tool`: `8`
  - `guard`: `2`
- Router default threshold: `40`

Evidence:

- `personal-skill-system/registry/route-map.generated.json`

### 1.3 Route Fixtures

- Total fixture cases: `37`
- Query language mix:
  - `en`: `16`
  - `zh`: `8`
  - `mixed`: `13`
  - `other`: `0`

Evidence:

- `personal-skill-system/registry/route-fixtures.generated.json`

### 1.4 Packs

- Total packs with manifest: `4`
- Pack names:
  - `experimental`
  - `personal-core`
  - `project-overlay`
  - `work-private`

Evidence:

- `personal-skill-system/packs/*/manifest.json`

### 1.5 Capability Modules

- Total module groups: `17`
- Total capability modules: `99`
- Rating buckets:
  - `top-ready`: `99`
  - `strong-but-not-top`: `0`
  - `thin`: `0`

Evidence:

- `personal-skill-system/registry/registry.generated.json` (`module-groups`)
- `personal-skill-system/registry/capability-ratings.generated.json`

## 2) Known Strengths (Evidence-Backed)

1. Layered architecture is already in place (`router + domains + workflows + tools + guards + registry + packs`) and identified as the right outer shape.
   - Source: `personal-skill-system/docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md` (section `4.1 What is already strong`)

2. Generated metadata is consistent enough to audit automatically.
   - Source: `personal-skill-system/docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md` (section `4.1 What is already strong`)

3. Internal audit currently rates the bundle as top-level under the weak-model-uplift frame (`Top-level enough now: 33`).
   - Source: `personal-skill-system/docs/SKILL_TOP_LEVEL_AUDIT_2026-04-20.md` (section `Current Verdict`)

## 3) Known Weak Spots (Evidence-Backed)

1. Route quality remains mostly heuristic; hybrid routing is still pending.
   - Source: `personal-skill-system/docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md` (sections `1 Executive Verdict`, `4.2 What still blocks a stronger claim`)

2. Expert depth is uneven; some expert references remain index-like and inflate depth claims.
   - Source: `personal-skill-system/docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md` (section `4.2`)
   - Source: `personal-skill-system/docs/PERSONAL_SKILL_SYSTEM_VNEXT_IMPLEMENTATION_BACKLOG_2026-04-22.md` (rule: do not count index-only references as depth)

3. Deterministic validation tools are still heuristic-first in several paths.
   - Source: `personal-skill-system/docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md` (sections `4.2`, `W4 Proof Tool Upgrade`)

4. No maintained uplift benchmark baseline yet (base vs base+skills vs stronger-model) and host smoke consistency is not fully established.
   - Source: `personal-skill-system/docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md` (sections `W1 Uplift Benchmarking`, `W5 Host Runtime and Pack Consistency`)

## 4) Commands Used To Produce This Baseline

```bash
node -e "const fs=require('fs');const o=JSON.parse(fs.readFileSync('personal-skill-system/registry/registry.generated.json','utf8'));const kindCounts={};for(const s of (o.skills||[])){kindCounts[s.kind]=(kindCounts[s.kind]||0)+1;}console.log('skills',o.skills.length);console.log('skillKinds',JSON.stringify(kindCounts));"
```

```bash
node -e "const fs=require('fs');const o=JSON.parse(fs.readFileSync('personal-skill-system/registry/route-map.generated.json','utf8'));const kindCounts={};for(const r of (o.routes||[])){kindCounts[r.kind]=(kindCounts[r.kind]||0)+1;}console.log('routes',o.routes.length);console.log('routeKinds',JSON.stringify(kindCounts));console.log('defaultThreshold',o['default-threshold']);"
```

```bash
node -e "const fs=require('fs');const o=JSON.parse(fs.readFileSync('personal-skill-system/registry/route-fixtures.generated.json','utf8'));const cases=o.cases||[];const lang={en:0,zh:0,mixed:0,other:0};for(const c of cases){const q=(c.query||'');const hasZh=/[\\u4e00-\\u9fff]/.test(q);const hasAscii=/[A-Za-z]/.test(q);if(hasZh&&hasAscii)lang.mixed++;else if(hasZh)lang.zh++;else if(hasAscii)lang.en++;else lang.other++;}console.log('fixtures',cases.length);console.log('fixtureLang',JSON.stringify(lang));"
```

```bash
node -e "const fs=require('fs');const path=require('path');const root='personal-skill-system/packs';const dirs=fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory());const names=dirs.filter(d=>fs.existsSync(path.join(root,d.name,'manifest.json'))).map(d=>d.name);console.log('packs',names.length);console.log('packNames',names.join(','));"
```

```bash
node -e "const fs=require('fs');const reg=JSON.parse(fs.readFileSync('personal-skill-system/registry/registry.generated.json','utf8'));const rating=JSON.parse(fs.readFileSync('personal-skill-system/registry/capability-ratings.generated.json','utf8'));const groups=reg['module-groups']||[];let modules=0;for(const g of groups){modules+=(g.modules||[]).length;}console.log('moduleGroups',groups.length);console.log('capabilityModules',modules);console.log('counts',JSON.stringify(rating.counts));"
```
