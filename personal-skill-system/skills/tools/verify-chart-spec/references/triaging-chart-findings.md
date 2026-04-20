# Triaging Chart Findings

## Triage Order

1. construction errors
2. deprecated API usage
3. invalid transform or coordinate shape
4. likely runtime omissions such as missing `render()`

## High-Confidence Findings

- `new Chart(...)` without `container`
- `chart.source(...)`
- `chart.position(...)`
- `chart.createView(...)`
- `chart.data(...)`
- `coordinate: { type: 'transpose' }`
- invalid palette names such as `coolwarm` or `jet`
- `coordinate.transform` written as object
- top-level `transform` carrying `fold` / `fetch` / similar data transforms
- `chart.guide()` style API usage
- `type: 'ruleX'` / `ruleY` / `regionX` / `regionY` / `venn`

## Medium-Confidence Findings

- multiple `chart.options(...)` calls
- `d3.*` usage in user chart files
- `y: ['start', 'end']` style range encoding
- singular `label: {}` usage
- nested `view` inside `children[]`
- composition containers missing `children[]`
- white or near-white mark fill
- explicit animate config
- overspecified default scale types
- top-level `legend.position` or `axis.position`
- render API payload missing `type` or `source`
- `legendFilter` enabled while legend is hidden
- `scrollbarFilter` or `sliderWheel` without their required components
- malformed top-level `slider` / `scrollbar` config shape
- `interaction.tooltip.items` used for content instead of mark-level tooltip
- tooltip field names that do not match nearby inline data
- tooltip config placed inside `style`
- `labels[].transform` written as object instead of array
- `rangeX` / `rangeY` missing encode
- annotation mark encode fields that do not match nearby inline data
- `lineX` / `lineY` missing required encode channel
- slider property drift such as `handleFill`
- scrollbar property drift such as raw `fill` or `style: { thumbFill }`
- image mark config drift such as `style.img` or function-based fixed `encode.x/y`
- image mark using `url` without `encode.src`
- `range` mark using `x1/y1` encode fields
- numeric constant in `labels[].text`
- `chartIndex` without shared tooltip
- tooltip `crosshairs` or `css` outside interaction tooltip config
- text mark missing its own data or parent view data
- image mark using `btoa(...)` or omitting size
- image mark missing `encode.src`

## Review Rule

If the file uses a wrapper that renames the chart variable or proxies `render()`, validate the finding against the real wrapper behavior before changing code.
