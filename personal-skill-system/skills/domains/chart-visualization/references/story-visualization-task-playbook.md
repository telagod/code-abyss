# Story Visualization Task Playbook

## Goal

Handle communication-first visualization tasks where the output is not only a chart, but a narrative or presentation artifact.

## Common Tasks

### Infographic DSL

- use `infographic/infographic-dsl-playbook.md`
- choose when the user needs poster-like structure, comparison panels, timelines, or process visuals

### T8 narrative text visualization

- use `narrative-t8/t8-narrative-playbook.md`
- choose when the user needs prose-first report output with annotated metrics and insight text

### Chart image generation API

- use `render-api/chart-image-api-playbook.md`
- choose when the user wants a remote-rendered image rather than local G2 code

### Icon retrieval

- use `icon/icon-retrieval-api.md`
- choose when the real ask is symbol assets for infographic or chart annotation work

## Selection Rule

- poster, layout block, communication artifact -> infographic
- insight report, metric explanation, narrative article -> T8
- pre-rendered image endpoint -> chart image API
- symbol asset retrieval -> icon API
