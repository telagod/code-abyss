'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { generateDocs } = require('../personal-skill-system/skills/tools/lib/doc-module-analysis');
const { analyzeQuality } = require('../personal-skill-system/skills/tools/lib/quality-analysis');
const { analyzeSecurity } = require('../personal-skill-system/skills/tools/lib/security-analysis');
const { analyzeSkillSystem } = require('../personal-skill-system/skills/tools/lib/skill-system');
const { analyzeChange, classifySensitiveChangeSurface, buildChangeRisk } = require('../personal-skill-system/skills/tools/lib/change-analysis');
const { analyzeChartSpec } = require('../personal-skill-system/skills/tools/lib/chart-spec-analysis');
const { analyzeS2Config } = require('../personal-skill-system/skills/tools/lib/s2-config-analysis');
const { evaluatePreCommit } = require('../personal-skill-system/skills/tools/lib/analyzers');

describe('personal skill system tool runtime', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pss-tools-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('generateDocs builds engineering-grade scaffold sections', () => {
    const report = generateDocs(tmpDir, { write: false });

    expect(report.preview['README.md']).toContain('## Public Surface');
    expect(report.preview['README.md']).toContain('## Verification');
    expect(report.preview['DESIGN.md']).toContain('## Dependencies');
    expect(report.preview['DESIGN.md']).toContain('## Failure Modes');
  });

  test('analyzeQuality detects python-specific maintainability smells', () => {
    const sample = path.join(tmpDir, 'bad.py');
    fs.writeFileSync(sample, [
      'def bad(items=[]):',
      '    try:',
      '        return items',
      '    except:',
      '        return []',
      ''
    ].join('\n'));

    const report = analyzeQuality(tmpDir, {});
    const messages = report.issues.map(item => item.message);

    expect(messages).toContain('mutable default argument detected');
    expect(messages).toContain('bare except clause hides unexpected failures');
  });

  test('analyzeSecurity detects unsafe deserialization and tls bypass', () => {
    const py = path.join(tmpDir, 'loader.py');
    const js = path.join(tmpDir, 'client.js');
    fs.writeFileSync(py, 'import yaml\ncfg = yaml.load(user_input)\n');
    fs.writeFileSync(js, 'https.request(url, { rejectUnauthorized: false })\n');

    const report = analyzeSecurity(tmpDir, {});
    const messages = report.findings.map(item => item.message);

    expect(messages).toContain('yaml.load may deserialize unsafe input');
    expect(messages).toContain('TLS verification appears disabled');
  });

  test('change risk helpers flag auth and config surfaces with stronger checks', () => {
    const sensitive = classifySensitiveChangeSurface([
      'src/auth/login.js',
      'config/deploy.yaml'
    ]);

    expect(sensitive).toEqual(expect.arrayContaining(['auth', 'config']));

    const risk = buildChangeRisk(
      { files: ['src/auth/login.js', 'config/deploy.yaml', 'src/api/handler.ts'] },
      { code: 2, doc: 0, test: 0, config: 1, asset: 0, other: 0 },
      ['src', 'config'],
      sensitive
    );

    expect(['medium', 'high', 'critical']).toContain(risk.level);
    expect(risk.recommendedChecks).toEqual(expect.arrayContaining(['verify-security', 'ship']));
  });

  test('analyzeSkillSystem passes on the portable bundle', () => {
    const target = path.join(__dirname, '..', 'personal-skill-system');
    const report = analyzeSkillSystem(target);

    expect(report.status).toBe('pass');
    expect(report.metrics.skillFiles).toBeGreaterThan(0);
    expect(report.metrics.routeFixtures).toBeGreaterThan(0);
  });

  test('analyzeChartSpec catches core G2 misuse patterns', () => {
    const sample = path.join(tmpDir, 'bad-chart.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ width: 640, height: 480 });",
      'chart.source(data);',
      "chart.options({ type: 'interval', transform: { type: 'stackY' }, coordinate: { type: 'transpose' }, encode: { y: ['start', 'end'] } });",
      "chart.options({ type: 'ruleX' });",
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'missing-container',
      'deprecated-source',
      'transform-not-array',
      'transpose-coordinate-type',
      'range-encode-array',
      'hallucinated-mark-type',
      'multiple-options-calls',
      'missing-render'
    ]));
  });

  test('analyzeChartSpec allows legal spaceLayer to view composition', () => {
    const sample = path.join(tmpDir, 'space-layer-ok.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'spaceLayer',",
      '  children: [',
      "    { type: 'view', data: [{ x: 1, y: 2 }], children: [{ type: 'line', encode: { x: 'x', y: 'y' } }] },",
      "    { type: 'line', data: [{ x: 1, y: 2 }], encode: { x: 'x', y: 'y' } },",
      '  ],',
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).not.toContain('nested-view-in-children');
    expect(rules).not.toContain('missing-children-on-composition');
  });

  test('analyzeChartSpec catches interaction dependency and component shape issues', () => {
    const sample = path.join(tmpDir, 'interaction-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'line',",
      '  legend: false,',
      "  interaction: { legendFilter: true, scrollbarFilter: true, sliderWheel: true, tooltip: { items: [{ field: 'value' }] } },",
      '  slider: true,',
      "  scrollbar: { ratio: 0.2 },",
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'legend-filter-without-legend',
      'scrollbar-filter-without-scrollbar',
      'slider-wheel-without-slider',
      'tooltip-items-in-interaction',
      'slider-boolean-top-level',
      'scrollbar-missing-axis-key'
    ]));
  });

  test('analyzeChartSpec validates render API payload requirements', () => {
    const bad = path.join(tmpDir, 'render-bad.ts');
    const good = path.join(tmpDir, 'render-good.ts');
    fs.writeFileSync(bad, "fetch('https://antv-studio.alipay.com/api/gpt-vis', { method: 'POST', body: JSON.stringify({ data: [] }) });\n");
    fs.writeFileSync(good, [
      "fetch('https://antv-studio.alipay.com/api/gpt-vis', {",
      "  method: 'POST',",
      "  body: JSON.stringify({ type: 'line', source: 'chart-visualization-skills', data: [{ time: '2025-01', value: 10 }] }),",
      '});',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const badRules = report.findings.filter(item => item.file === 'render-bad.ts').map(item => item.rule);
    const goodRules = report.findings.filter(item => item.file === 'render-good.ts').map(item => item.rule);

    expect(badRules).toEqual(expect.arrayContaining(['render-api-missing-source', 'render-api-missing-type']));
    expect(goodRules).toHaveLength(0);
  });

  test('analyzeChartSpec catches guide, label transform, and component property drift', () => {
    const sample = path.join(tmpDir, 'annotation-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      "chart.guide().line({ start: ['min', 50], end: ['max', 50] });",
      'chart.options({',
      "  type: 'interval',",
      "  labels: [{ text: 'value', transform: { type: 'overflowHide' } }],",
      "  style: { tooltip: { title: 'name' } },",
      "  slider: { x: { handleFill: 'red' } },",
      "  scrollbar: { x: { fill: 'red', style: { thumbFill: 'red' } } },",
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'deprecated-guide-api',
      'label-transform-not-array',
      'tooltip-in-style-object',
      'slider-invalid-handle-fill-key',
      'scrollbar-invalid-fill-key',
      'component-style-wrapper-misuse'
    ]));
  });

  test('analyzeChartSpec catches range, image, and numeric label drift', () => {
    const sample = path.join(tmpDir, 'mark-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'range',",
      "  data: [{ x0: 20, x1: 40, y0: 50, y1: 80 }],",
      "  encode: { x: 'x0', x1: 'x1', y: 'y0', y1: 'y1' },",
      "  labels: [{ text: 0 }],",
      '});',
      "const imageChart = new Chart({ container: 'container2' });",
      'imageChart.options({',
      "  type: 'image',",
      "  data: [{ url: 'https://example.com/image.png' }],",
      "  encode: { x: 'x', y: 'y' },",
      '});',
      'chart.render();',
      'imageChart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'range-mark-x1-y1-misuse',
      'label-text-numeric-constant',
      'image-mark-missing-src-encode'
    ]));
  });

  test('analyzeChartSpec catches chartIndex, text data, and tooltip placement issues', () => {
    const sample = path.join(tmpDir, 'navigation-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'line',",
      "  interaction: { chartIndex: true },",
      "  tooltip: { crosshairs: true, css: { '.g2-tooltip': { color: '#fff' } } },",
      '});',
      "const textChart = new Chart({ container: 'container2' });",
      'textChart.options({',
      "  type: 'text',",
      "  encode: { x: 'month', y: 'value', text: 'label' },",
      '});',
      'chart.render();',
      'textChart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'chart-index-without-shared-tooltip',
      'tooltip-crosshairs-outside-interaction',
      'tooltip-css-outside-interaction',
      'text-mark-missing-data'
    ]));
  });

  test('analyzeChartSpec catches inline mark field mismatches and tooltip array misuse', () => {
    const sample = path.join(tmpDir, 'field-mismatch-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'view',",
      '  children: [',
      "    { type: 'lineY', data: [{ value: 100 }], encode: { y: 'y' } },",
      "    { type: 'rangeX', data: [{ start: 10, finish: 20 }], encode: { x: 'start', x1: 'end' } },",
      "    { type: 'text', data: [{ x: 'Mar', y: 91, label: 'peak' }], encode: { x: 'x', y: 'y', text: 'name' } },",
      '  ],',
      '});',
      "const tooltipChart = new Chart({ container: 'container2' });",
      'tooltipChart.options({',
      "  type: 'line',",
      "  interaction: [{ type: 'tooltip', items: [{ field: 'value' }] }],",
      '});',
      'chart.render();',
      'tooltipChart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'liney-encode-field-mismatch',
      'rangex-encode-field-mismatch',
      'textmark-encode-text-mismatch',
      'tooltip-items-in-interaction-array'
    ]));
  });

  test('analyzeChartSpec catches missing encode on rangeY and invalid image payloads', () => {
    const sample = path.join(tmpDir, 'range-image-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'rangeY',",
      "  data: [{ y: 54, y1: 72 }],",
      '});',
      "const imageChart = new Chart({ container: 'container2' });",
      'imageChart.options({',
      "  type: 'image',",
      "  encode: { x: 'x', y: 'y', src: btoa(imageData) },",
      '});',
      'chart.render();',
      'imageChart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'rangey-missing-encode',
      'image-mark-btoa-src',
      'image-mark-missing-size'
    ]));
  });

  test('analyzeChartSpec catches chartIndex and tooltip placement misuse', () => {
    const sample = path.join(tmpDir, 'chart-index-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'line',",
      "  interaction: { chartIndex: true },",
      "  tooltip: { crosshairs: true, css: { '.g2-tooltip': { color: '#fff' } } },",
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'chart-index-without-shared-tooltip',
      'tooltip-crosshairs-outside-interaction',
      'tooltip-css-outside-interaction'
    ]));
  });

  test('analyzeChartSpec allows legal chartIndex with shared tooltip', () => {
    const sample = path.join(tmpDir, 'chart-index-good.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'line',",
      "  interaction: { chartIndex: true, tooltip: { shared: true } },",
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).not.toContain('chart-index-without-shared-tooltip');
  });

  test('analyzeChartSpec catches text mark missing inherited or local data', () => {
    const sample = path.join(tmpDir, 'text-data-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'text',",
      "  encode: { x: 'month', y: 'value', text: 'label' },",
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toContain('text-mark-missing-data');
  });

  test('analyzeChartSpec allows text mark inheriting data from parent view', () => {
    const sample = path.join(tmpDir, 'text-data-good.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'view',",
      "  data: [{ month: 'Jan', value: 10, label: 'peak' }],",
      '  children: [',
      "    { type: 'text', encode: { x: 'month', y: 'value', text: 'label' } },",
      '  ],',
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).not.toContain('text-mark-missing-data');
  });

  test('analyzeChartSpec catches lineX lineY and image marks missing core bindings', () => {
    const sample = path.join(tmpDir, 'annotation-bindings-bad.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'view',",
      '  children: [',
      "    { type: 'lineX', data: [{ x: 5 }] },",
      "    { type: 'lineY', data: [{ y: 10 }] },",
      "    { type: 'image', data: [{ x: 'A', y: 1 }], encode: { x: 'x', y: 'y' } },",
      '  ],',
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'linex-missing-encode-x',
      'liney-missing-encode-y',
      'image-mark-missing-src'
    ]));
  });

  test('analyzeChartSpec allows lineX lineY and image marks with correct bindings', () => {
    const sample = path.join(tmpDir, 'annotation-bindings-good.ts');
    fs.writeFileSync(sample, [
      "import { Chart } from '@antv/g2';",
      "const chart = new Chart({ container: 'container' });",
      'chart.options({',
      "  type: 'view',",
      '  children: [',
      "    { type: 'lineX', data: [{ x: 5 }], encode: { x: 'x' } },",
      "    { type: 'lineY', data: [{ y: 10 }], encode: { y: 'y' } },",
      "    { type: 'image', data: [{ icon: 'https://example.com/a.png', x: 'A', y: 1 }], encode: { x: 'x', y: 'y', src: 'icon', size: 24 } },",
      '  ],',
      '});',
      'chart.render();',
      ''
    ].join('\n'));

    const report = analyzeChartSpec(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).not.toContain('linex-missing-encode-x');
    expect(rules).not.toContain('liney-missing-encode-y');
    expect(rules).not.toContain('image-mark-missing-src');
  });

  test('analyzeS2Config catches SheetComponent prop and field-shape issues', () => {
    const sample = path.join(tmpDir, 's2-bad.tsx');
    fs.writeFileSync(sample, [
      "import { SheetComponent } from '@antv/s2-react';",
      "import { PivotSheet } from '@antv/s2';",
      "const dataCfg = { fields: { rows: 'province', columns: ['type'] }, data: [] };",
      'const App = () => <SheetComponent sheetType="pivot" showPagination={true} />;',
      'const sheet = new PivotSheet(container, dataCfg, options);',
      ''
    ].join('\n'));

    const report = analyzeS2Config(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'sheetcomponent-missing-datacfg',
      'sheetcomponent-missing-options',
      's2-fields-rows-not-array',
      's2-pivot-like-fields-missing-values',
      's2-imperative-missing-destroy'
    ]));
  });

  test('analyzeS2Config allows healthy SheetComponent and dataCfg usage', () => {
    const sample = path.join(tmpDir, 's2-good.tsx');
    fs.writeFileSync(sample, [
      "import { SheetComponent } from '@antv/s2-react';",
      "const dataCfg = { data: [], fields: { rows: ['province'], columns: ['type'], values: ['price'] } };",
      "const options = { width: 600, height: 400, pagination: { current: 1, pageSize: 20 } };",
      'const App = () => <SheetComponent sheetType="pivot" dataCfg={dataCfg} options={options} showPagination={true} />;',
      ''
    ].join('\n'));

    const report = analyzeS2Config(tmpDir, {});

    expect(report.findings).toHaveLength(0);
  });

  test('analyzeS2Config catches table sheet inline field mismatch and missing render', () => {
    const sample = path.join(tmpDir, 's2-table-bad.tsx');
    fs.writeFileSync(sample, [
      "import { SheetComponent } from '@antv/s2-react';",
      "import { TableSheet } from '@antv/s2';",
      'const App = () => <SheetComponent sheetType="table" dataCfg={{ data: [], fields: { rows: [\'province\'] } }} options={{ width: 300, height: 200 }} />;',
      "const table = new TableSheet(container, { data: [], fields: { columns: ['a'] } }, options);",
      ''
    ].join('\n'));

    const report = analyzeS2Config(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toEqual(expect.arrayContaining([
      'table-sheet-inline-missing-columns',
      's2-imperative-missing-render',
      's2-imperative-missing-destroy'
    ]));
  });

  test('analyzeS2Config allows table sheet inline columns and imperative cleanup', () => {
    const sample = path.join(tmpDir, 's2-table-good.tsx');
    fs.writeFileSync(sample, [
      "import { SheetComponent } from '@antv/s2-react';",
      "import { TableSheet } from '@antv/s2';",
      'const App = () => <SheetComponent sheetType="table" dataCfg={{ data: [], fields: { columns: [\'province\', \'city\'] } }} options={{ width: 300, height: 200 }} />;',
      "const table = new TableSheet(container, { data: [], fields: { columns: ['a'] } }, options);",
      'table.render();',
      'table.destroy();',
      ''
    ].join('\n'));

    const report = analyzeS2Config(tmpDir, {});

    expect(report.findings).toHaveLength(0);
  });

  test('analyzeS2Config catches showPagination without inline pagination config', () => {
    const sample = path.join(tmpDir, 's2-pagination-bad.tsx');
    fs.writeFileSync(sample, [
      "import { SheetComponent } from '@antv/s2-react';",
      'const App = () => <SheetComponent sheetType="pivot" dataCfg={{ data: [], fields: { rows: [\'province\'], columns: [\'type\'], values: [\'price\'] } }} options={{ width: 300, height: 200 }} showPagination={true} />;',
      ''
    ].join('\n'));

    const report = analyzeS2Config(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).toContain('showpagination-without-pagination');
  });

  test('analyzeS2Config allows showPagination when inline pagination config exists', () => {
    const sample = path.join(tmpDir, 's2-pagination-good.tsx');
    fs.writeFileSync(sample, [
      "import { SheetComponent } from '@antv/s2-react';",
      'const App = () => <SheetComponent sheetType="pivot" dataCfg={{ data: [], fields: { rows: [\'province\'], columns: [\'type\'], values: [\'price\'] } }} options={{ width: 300, height: 200, pagination: { current: 1, pageSize: 20 } }} showPagination={true} />;',
      ''
    ].join('\n'));

    const report = analyzeS2Config(tmpDir, {});
    const rules = report.findings.map(item => item.rule);

    expect(rules).not.toContain('showpagination-without-pagination');
  });

  test('pre-commit gate ignores quality debt outside changed files', () => {
    const changedDoc = path.join(tmpDir, 'README.md');
    const debtCode = path.join(tmpDir, 'lib', 'legacy.js');

    fs.mkdirSync(path.dirname(debtCode), { recursive: true });
    fs.writeFileSync(changedDoc, '# readme\n');
    fs.writeFileSync(debtCode, [
      'function debt(a, b, c, d, e, f, g) {',
      '  if (a) {',
      '    if (b) {',
      '      if (c) {',
      '        if (d) {',
      '          if (e) {',
      '            if (f) {',
      '              if (g) { return 1; }',
      '            }',
      '          }',
      '        }',
      '      }',
      '    }',
      '  }',
      '  return 0;',
      '}',
      ''
    ].join('\n'));

    const report = evaluatePreCommit(tmpDir, { changedFiles: ['README.md'] });

    expect(report.status).toBe('pass');
    expect(report.detail.qualityDebtOutsideChangedFiles).toBeGreaterThan(0);
    expect(report.detail.qualityWarningsInChangedFiles).toBe(0);
  });

  test('pre-commit gate blocks quality warnings inside changed files', () => {
    const changedCode = path.join(tmpDir, 'src', 'risk.js');
    fs.mkdirSync(path.dirname(changedCode), { recursive: true });
    const longBody = Array.from({ length: 70 }, (_, index) => `  const v${index} = ${index};`).join('\n');
    fs.writeFileSync(changedCode, `function risk() {\n${longBody}\n  return true;\n}\n`);

    const report = evaluatePreCommit(tmpDir, { changedFiles: ['src/risk.js'] });

    expect(report.status).toBe('block');
    expect(report.blockers).toContain('quality scan reported warning-level issues in changed files');
    expect(report.detail.qualityWarningsInChangedFiles).toBeGreaterThan(0);
  });

  test('analyzeChange accepts --changed-files fallback when git is unavailable', () => {
    const changedCode = path.join(tmpDir, 'src', 'app.js');
    fs.mkdirSync(path.dirname(changedCode), { recursive: true });
    fs.writeFileSync(changedCode, 'module.exports = 1;\n');

    const report = analyzeChange(tmpDir, { mode: 'working', changedFiles: ['src/app.js'] });

    expect(report.summary).toContain('external-arg');
    expect(report.changedFiles).toContain('src/app.js');
    expect(report.findings.map(item => item.message)).toContain('using externally supplied changed files from --changed-files');
  });

  test('analyzeChange uses env fallback when git repo is absent', () => {
    const changedCode = path.join(tmpDir, 'src', 'env-app.js');
    const prev = process.env.PSS_CHANGED_FILES;
    fs.mkdirSync(path.dirname(changedCode), { recursive: true });
    fs.writeFileSync(changedCode, 'module.exports = 2;\n');
    process.env.PSS_CHANGED_FILES = 'src/env-app.js';

    try {
      const report = analyzeChange(tmpDir, 'working');

      expect(report.summary).toContain('external-env-no-git');
      expect(report.changedFiles).toContain('src/env-app.js');
      expect(report.findings.map(item => item.message)).toContain('using externally supplied changed files from environment fallback');
    } finally {
      if (prev === undefined) delete process.env.PSS_CHANGED_FILES;
      else process.env.PSS_CHANGED_FILES = prev;
    }
  });
});
