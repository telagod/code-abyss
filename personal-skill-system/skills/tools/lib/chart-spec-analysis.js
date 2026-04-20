'use strict';

const fs = require('fs');
const path = require('path');
const { walkFiles, readText, relativeTo, classifyPath } = require('./runtime');
const { summarizeIssueHotspots } = require('./quality-analysis');

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.html', '.vue']);
const HALLUCINATED_MARK_TYPES = ['ruleX', 'ruleY', 'regionX', 'regionY', 'venn'];
const INVALID_PALETTES = ['blueorange', 'redgreen', 'hot', 'jet', 'coolwarm'];
const DATA_TRANSFORM_TYPES = ['fetch', 'filter', 'sort', 'sortBy', 'fold', 'slice', 'ema', 'kde', 'log'];
const LABEL_TRANSFORM_TYPES = ['overflowHide', 'overlapHide', 'overlapDodgeY', 'contrastReverse', 'exceedAdjust', 'overflowStroke'];
const CHAIN_MARKS = [
  'interval', 'line', 'area', 'point', 'rect', 'cell', 'polygon', 'path', 'shape',
  'link', 'connector', 'vector', 'box', 'boxplot', 'density', 'heatmap', 'beeswarm',
  'treemap', 'pack', 'partition', 'tree', 'sankey', 'chord', 'forceGraph', 'wordCloud',
  'gauge', 'liquid', 'image', 'text'
];

function extOf(file) {
  return path.extname(file).toLowerCase();
}

function lineNumberAt(text, index) {
  return String(text.slice(0, index)).split(/\r?\n/).length;
}

function isChartCodeFile(relPath) {
  return classifyPath(relPath) === 'code' && CODE_EXTENSIONS.has(extOf(relPath));
}

function buildTargetFiles(targetPath, options = {}) {
  const resolved = path.resolve(targetPath);
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    return {
      root: path.dirname(resolved),
      files: [resolved]
    };
  }

  return {
    root: resolved,
    files: walkFiles(resolved, options)
  };
}

function findMatching(text, openIndex, openChar, closeChar) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === openChar) depth += 1;
    if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findEnclosingObject(text, index, tester) {
  let cursor = index;
  let attempts = 0;
  while (cursor >= 0 && attempts < 12) {
    const openBrace = text.lastIndexOf('{', cursor);
    if (openBrace === -1) break;
    const closeBrace = findMatching(text, openBrace, '{', '}');
    if (closeBrace >= index) {
      const snippet = text.slice(openBrace, closeBrace + 1);
      if (!tester || tester(snippet)) {
        return { openBrace, closeBrace, snippet };
      }
    }
    cursor = openBrace - 1;
    attempts += 1;
  }
  return null;
}

function collectInlineObjectKeys(snippet) {
  const dataMatches = [...String(snippet || '').matchAll(/\bdata\s*:\s*\[\s*\{([\s\S]{0,260}?)\}\s*\]/gi)];
  if (dataMatches.length === 0) return new Set();
  const keys = new Set();
  const keyPattern = /([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g;
  let keyMatch;
  while ((keyMatch = keyPattern.exec(dataMatches[dataMatches.length - 1][1])) !== null) {
    keys.add(keyMatch[1]);
  }
  return keys;
}

function extractEncodeField(snippet, channel) {
  const match = String(snippet || '').match(new RegExp(`\\bencode\\s*:\\s*\\{[\\s\\S]{0,220}?\\b${channel}\\s*:\\s*['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]`, 'i'));
  return match ? match[1] : null;
}

function extractChartVariables(text) {
  const vars = [];
  const regex = /\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*new\s+Chart\s*\(/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    vars.push({ name: match[1], index: match.index });
  }
  return vars;
}

function findFirstLineMatch(text, pattern) {
  const match = pattern.exec(text);
  if (!match) return null;
  return {
    index: match.index,
    line_number: lineNumberAt(text, match.index)
  };
}

function detectMissingContainer(text) {
  const findings = [];
  const regex = /new\s+Chart\s*\(/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const openParen = text.indexOf('(', match.index);
    const closeParen = findMatching(text, openParen, '(', ')');
    if (closeParen === -1) continue;
    const argsText = text.slice(openParen + 1, closeParen);
    if (!/\bcontainer\s*:/.test(argsText)) {
      findings.push({
        severity: 'error',
        rule: 'missing-container',
        line_number: lineNumberAt(text, match.index),
        message: 'new Chart(...) is missing required container configuration'
      });
    }
  }
  return findings;
}

function detectChartVariableIssues(text) {
  const findings = [];
  const chartVars = extractChartVariables(text);
  const anyRenderCall = /\.\s*render\s*\(/.test(text);

  for (const chartVar of chartVars) {
    const safeName = chartVar.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const optionsRegex = new RegExp(`\\b${safeName}\\.options\\s*\\(`, 'g');
    const optionsCount = (text.match(optionsRegex) || []).length;
    if (optionsCount > 1) {
      findings.push({
        severity: 'warning',
        rule: 'multiple-options-calls',
        line_number: lineNumberAt(text, chartVar.index),
        message: `chart variable '${chartVar.name}' calls options() multiple times; later calls overwrite earlier config`
      });
    }

    const renderRegex = new RegExp(`\\b${safeName}\\.render\\s*\\(`);
    if (!renderRegex.test(text) && !anyRenderCall) {
      findings.push({
        severity: 'warning',
        rule: 'missing-render',
        line_number: lineNumberAt(text, chartVar.index),
        message: `chart variable '${chartVar.name}' has no render() call`
      });
    }

    const chainRegex = new RegExp(`\\b${safeName}\\.(${CHAIN_MARKS.join('|')})\\s*\\(`, 'g');
    let chainMatch;
    while ((chainMatch = chainRegex.exec(text)) !== null) {
      findings.push({
        severity: 'error',
        rule: 'v4-chain-api',
        line_number: lineNumberAt(text, chainMatch.index),
        message: `chart variable '${chartVar.name}' uses chained mark API '${chainMatch[1]}()' instead of v5 Spec Mode`
      });
    }

    const sourceRegex = new RegExp(`\\b${safeName}\\.source\\s*\\(`, 'g');
    const dataRegex = new RegExp(`\\b${safeName}\\.data\\s*\\(`, 'g');
    const positionRegex = new RegExp(`\\b${safeName}\\.position\\s*\\(`, 'g');
    const createViewRegex = new RegExp(`\\b${safeName}\\.createView\\s*\\(`, 'g');
    const guideRegex = new RegExp(`\\b${safeName}\\.guide\\s*\\(`, 'g');
    const sourceMatch = findFirstLineMatch(text, sourceRegex);
    if (sourceMatch) {
      findings.push({
        severity: 'error',
        rule: 'deprecated-source',
        line_number: sourceMatch.line_number,
        message: `chart variable '${chartVar.name}' uses deprecated source() API`
      });
    }
    const dataMatch = findFirstLineMatch(text, dataRegex);
    if (dataMatch) {
      findings.push({
        severity: 'error',
        rule: 'deprecated-data-method',
        line_number: dataMatch.line_number,
        message: `chart variable '${chartVar.name}' uses deprecated data() API; move data into chart.options({...})`
      });
    }
    const positionMatch = findFirstLineMatch(text, positionRegex);
    if (positionMatch) {
      findings.push({
        severity: 'error',
        rule: 'deprecated-position',
        line_number: positionMatch.line_number,
        message: `chart variable '${chartVar.name}' uses deprecated position() API`
      });
    }
    const createViewMatch = findFirstLineMatch(text, createViewRegex);
    if (createViewMatch) {
      findings.push({
        severity: 'error',
        rule: 'deprecated-create-view',
        line_number: createViewMatch.line_number,
        message: `chart variable '${chartVar.name}' uses deprecated createView() instead of composition containers`
      });
    }
    const guideMatch = findFirstLineMatch(text, guideRegex);
    if (guideMatch) {
      findings.push({
        severity: 'error',
        rule: 'deprecated-guide-api',
        line_number: guideMatch.line_number,
        message: `chart variable '${chartVar.name}' uses deprecated guide() API; use annotation marks in view.children instead`
      });
    }
  }

  return findings;
}

function detectRegexFindings(text) {
  const findings = [];
  const rules = [
    {
      severity: 'error',
      rule: 'transpose-coordinate-type',
      pattern: /\bcoordinate\s*:\s*\{\s*type\s*:\s*['"]transpose['"]/g,
      message: 'transpose is used as coordinate type instead of coordinate.transform'
    },
    {
      severity: 'error',
      rule: 'coordinate-transform-not-array',
      pattern: /\bcoordinate\s*:\s*\{[\s\S]{0,200}?\btransform\s*:\s*\{\s*type\s*:/g,
      message: 'coordinate.transform is configured as object instead of array'
    },
    {
      severity: 'warning',
      rule: 'range-encode-array',
      pattern: /\bencode\s*:\s*\{[\s\S]{0,400}?\by\s*:\s*\[[^\]]+\]/g,
      message: 'range encoding uses y: [...] instead of y and y1 channels'
    },
    {
      severity: 'warning',
      rule: 'singular-label-config',
      pattern: /\btype\s*:\s*['"][^'"]+['"][\s\S]{0,320}?\blabel\s*:\s*\{/g,
      message: 'singular label config found; G2 mark config expects labels: []'
    },
    {
      severity: 'warning',
      rule: 'white-fill-style',
      pattern: /\bstyle\s*:\s*\{[\s\S]{0,220}?\bfill\s*:\s*['"](#fff|#ffffff|white)['"]/gi,
      message: 'white or near-white fill detected; verify that the mark will remain visible against the background'
    },
    {
      severity: 'info',
      rule: 'animate-config-present',
      pattern: /\banimate\s*:\s*(true|\{|\[)/g,
      message: 'explicit animate config found; verify that animation was intentionally requested'
    },
    {
      severity: 'error',
      rule: 'invalid-palette-name',
      pattern: new RegExp(`\\bpalette\\s*:\\s*['"](${INVALID_PALETTES.join('|')})['"]`, 'gi'),
      message: 'invalid palette name detected; use a documented palette or explicit range'
    },
    {
      severity: 'info',
      rule: 'overspecified-scale-type',
      pattern: /\bscale\s*:\s*\{[\s\S]{0,260}?\btype\s*:\s*['"](linear|band|point)['"]/gi,
      message: 'default scale type is explicitly specified; verify that this is necessary instead of relying on G2 inference'
    },
    {
      severity: 'warning',
      rule: 'user-code-d3',
      pattern: /\bd3\.[A-Za-z_$][A-Za-z0-9_$]*\s*\(/g,
      message: 'd3.* usage found in chart code; prefer native JS or G2 built-ins in user space'
    },
    {
      severity: 'warning',
      rule: 'marks-config',
      pattern: /\bmarks\s*:\s*\[/g,
      message: 'marks[] config found; prefer view.children for multi-mark composition'
    },
    {
      severity: 'warning',
      rule: 'layers-config',
      pattern: /\blayers\s*:\s*\[/gi,
      message: 'layers[] config found; prefer supported G2 composition containers'
    },
    {
      severity: 'warning',
      rule: 'top-level-legend-position',
      pattern: /\blegend\s*:\s*\{\s*(position|orientation)\s*:/gi,
      message: 'legend config uses top-level position/orientation; verify that legend is keyed by channel such as legend.color'
    },
    {
      severity: 'warning',
      rule: 'top-level-axis-position',
      pattern: /\baxis\s*:\s*\{\s*position\s*:/gi,
      message: 'axis config uses top-level position; verify that axis is keyed by channel such as axis.y.position'
    },
    {
      severity: 'warning',
      rule: 'nested-children-array',
      pattern: /children\s*:\s*\[[\s\S]{0,320}?children\s*:\s*\[[\s\S]{0,320}?children\s*:\s*\[/gi,
      message: 'nested children[] composition found; verify whether unsupported nested composition is being used'
    }
  ];

  for (const rule of rules) {
    let match;
    while ((match = rule.pattern.exec(text)) !== null) {
      findings.push({
        severity: rule.severity,
        rule: rule.rule,
        line_number: lineNumberAt(text, match.index),
        message: rule.message
      });
    }
  }

  const typePattern = new RegExp(`\\btype\\s*:\\s*['"](${HALLUCINATED_MARK_TYPES.join('|')})['"]`, 'g');
  let typeMatch;
  while ((typeMatch = typePattern.exec(text)) !== null) {
    findings.push({
      severity: 'error',
      rule: 'hallucinated-mark-type',
      line_number: lineNumberAt(text, typeMatch.index),
      message: `hallucinated or unsupported mark type '${typeMatch[1]}' detected`
    });
  }

  return findings;
}

function detectLabelTransformIssues(text) {
  const findings = [];

  const labelTransformObjectPattern = new RegExp(`\\blabels\\s*:\\s*\\[[\\s\\S]{0,260}?\\btransform\\s*:\\s*\\{\\s*type\\s*:\\s*['"](${LABEL_TRANSFORM_TYPES.join('|')})['"]`, 'gi');
  let match;
  while ((match = labelTransformObjectPattern.exec(text)) !== null) {
    findings.push({
      severity: 'error',
      rule: 'label-transform-not-array',
      line_number: lineNumberAt(text, match.index),
      message: 'labels[].transform is configured as object; use an array of transform descriptors'
    });
  }

  const keyPattern = /\blabelTransform[s]?\s*:/gi;
  while ((match = keyPattern.exec(text)) !== null) {
    const contextStart = Math.max(0, match.index - 120);
    const context = text.slice(contextStart, match.index);
    if (/\baxis\s*:\s*\{[\s\S]{0,120}$/i.test(context)) {
      continue;
    }
    findings.push({
      severity: 'warning',
      rule: 'suspicious-label-transform-key',
      line_number: lineNumberAt(text, match.index),
      message: 'labelTransform-style key found outside obvious axis config; verify that label transforms are placed on labels[].transform as intended'
    });
  }

  return findings;
}

function detectTransformArrayIssues(text) {
  const findings = [];
  const pattern = /\btransform\s*:\s*\{\s*type\s*:/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const contextStart = Math.max(0, match.index - 140);
    const context = text.slice(contextStart, match.index);
    if (/coordinate\s*:\s*\{[\s\S]{0,40}$/i.test(context)) {
      continue;
    }
    if (/labels\s*:\s*\[[\s\S]{0,140}$/i.test(context)) {
      continue;
    }
    findings.push({
      severity: 'error',
      rule: 'transform-not-array',
      line_number: lineNumberAt(text, match.index),
      message: 'transform is configured as object instead of array'
    });
  }
  return findings;
}

function detectDataTransformPlacement(text) {
  const findings = [];
  const pattern = new RegExp(`\\btransform\\s*:\\s*\\[[\\s\\S]{0,300}?type\\s*:\\s*['"](${DATA_TRANSFORM_TYPES.join('|')})['"]`, 'gi');
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const contextStart = Math.max(0, match.index - 120);
    const context = text.slice(contextStart, match.index);
    if (/\bdata\s*:\s*\{[\s\S]{0,120}$/i.test(context)) {
      continue;
    }
    findings.push({
      severity: 'error',
      rule: 'data-transform-at-mark-level',
      line_number: lineNumberAt(text, match.index),
      message: 'data transform appears under top-level transform; place it under data.transform instead'
    });
  }
  return findings;
}

function detectNestedViewUsage(text) {
  const findings = [];
  const pattern = /children\s*:\s*\[[\s\S]{0,220}?\{\s*type\s*:\s*['"]view['"][\s\S]{0,220}?children\s*:\s*\[/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const contextStart = Math.max(0, match.index - 320);
    const context = text.slice(contextStart, match.index + match[0].length);
    if (/type\s*:\s*['"](spaceLayer|spaceFlex)['"][\s\S]{0,320}?children\s*:\s*\[[\s\S]{0,220}?\{\s*type\s*:\s*['"]view['"]/i.test(context)) {
      continue;
    }
    findings.push({
      severity: 'error',
      rule: 'nested-view-in-children',
      line_number: lineNumberAt(text, match.index),
      message: 'nested view container found inside children[]; place data directly on the child mark or use top-level composition'
    });
  }
  return findings;
}

function detectViewContainerIssues(text) {
  const findings = [];
  const pattern = /\btype\s*:\s*['"](view|spaceLayer|spaceFlex)['"]/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const snippet = text.slice(match.index, match.index + 260);
    if (!/\bchildren\s*:\s*\[/.test(snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'missing-children-on-composition',
        line_number: lineNumberAt(text, match.index),
        message: `composition container '${match[1]}' is missing children[] nearby; verify that the composition is complete`
      });
    }
  }
  return findings;
}

function detectRenderApiPayloadIssues(text) {
  const findings = [];
  const endpointPattern = /antv-studio\.alipay\.com\/api\/gpt-vis/gi;
  let match;
  while ((match = endpointPattern.exec(text)) !== null) {
    const snippet = text.slice(match.index, match.index + 900);
    const line = lineNumberAt(text, match.index);
    if (!(/["']source["']\s*:\s*["']chart-visualization-skills["']/i.test(snippet) || /\bsource\s*:\s*["']chart-visualization-skills["']/i.test(snippet))) {
      findings.push({
        severity: 'warning',
        rule: 'render-api-missing-source',
        line_number: line,
        message: 'chart render API payload may be missing required source: \"chart-visualization-skills\"'
      });
    }
    if (!(/["']type["']\s*:\s*["'][A-Za-z0-9-]+["']/i.test(snippet) || /\btype\s*:\s*["'][A-Za-z0-9-]+["']/i.test(snippet))) {
      findings.push({
        severity: 'warning',
        rule: 'render-api-missing-type',
        line_number: line,
        message: 'chart render API payload may be missing required type field'
      });
    }
  }

  return findings;
}

function detectInteractionDependencyIssues(text) {
  const findings = [];

  if (/legend\s*:\s*false[\s\S]{0,240}?interaction\s*:\s*\{[\s\S]{0,160}?legendFilter\s*:\s*true/gi.test(text) ||
      /interaction\s*:\s*\{[\s\S]{0,160}?legendFilter\s*:\s*true[\s\S]{0,240}?legend\s*:\s*false/gi.test(text)) {
    const idx = text.search(/legend\s*:\s*false|legendFilter\s*:\s*true/i);
    findings.push({
      severity: 'warning',
      rule: 'legend-filter-without-legend',
      line_number: lineNumberAt(text, idx),
      message: 'legendFilter is enabled while legend is hidden; legend interaction will have no visible trigger'
    });
  }

  if (/interaction\s*:\s*\{[\s\S]{0,180}?scrollbarFilter\s*:\s*true/gi.test(text) && !/scrollbar\s*:\s*\{[\s\S]{0,120}?[xy]\s*:/i.test(text)) {
    const idx = text.search(/scrollbarFilter\s*:\s*true/i);
    findings.push({
      severity: 'warning',
      rule: 'scrollbar-filter-without-scrollbar',
      line_number: lineNumberAt(text, idx),
      message: 'scrollbarFilter is enabled without a visible scrollbar config'
    });
  }

  if (/interaction\s*:\s*\{[\s\S]{0,180}?sliderWheel\s*:\s*true/gi.test(text) && !/slider\s*:\s*\{[\s\S]{0,120}?[xy]\s*:/i.test(text)) {
    const idx = text.search(/sliderWheel\s*:\s*true/i);
    findings.push({
      severity: 'warning',
      rule: 'slider-wheel-without-slider',
      line_number: lineNumberAt(text, idx),
      message: 'sliderWheel is enabled without a visible slider config'
    });
  }

  if (/interaction\s*:\s*\{[\s\S]{0,220}?sliderWheel\s*:\s*true/gi.test(text) && !/interaction\s*:\s*\{[\s\S]{0,220}?sliderFilter\s*:\s*true/i.test(text)) {
    const idx = text.search(/sliderWheel\s*:\s*true/i);
    findings.push({
      severity: 'warning',
      rule: 'slider-wheel-without-slider-filter',
      line_number: lineNumberAt(text, idx),
      message: 'sliderWheel is enabled without sliderFilter; wheel interaction may not have effect'
    });
  }

  if (/interaction\s*:\s*\{[\s\S]{0,260}?scrollbarFilter\s*:\s*true[\s\S]{0,160}?sliderFilter\s*:\s*true/gi.test(text) ||
      /interaction\s*:\s*\{[\s\S]{0,260}?sliderFilter\s*:\s*true[\s\S]{0,160}?scrollbarFilter\s*:\s*true/gi.test(text)) {
    const idx = text.search(/scrollbarFilter\s*:\s*true|sliderFilter\s*:\s*true/i);
    findings.push({
      severity: 'warning',
      rule: 'scrollbar-filter-with-slider-filter',
      line_number: lineNumberAt(text, idx),
      message: 'scrollbarFilter and sliderFilter appear enabled together; verify that these interactions are not conflicting'
    });
  }

  const interactionPattern = /\binteraction\s*:\s*\{/gi;
  let interactionMatch;
  while ((interactionMatch = interactionPattern.exec(text)) !== null) {
    const openBrace = text.indexOf('{', interactionMatch.index);
    const closeBrace = findMatching(text, openBrace, '{', '}');
    if (closeBrace === -1) continue;
    const interactionBody = text.slice(openBrace, closeBrace + 1);
    if (/\bchartIndex\s*:\s*(true|\{)/i.test(interactionBody) && !/\btooltip\s*:\s*\{[\s\S]{0,160}?\bshared\s*:\s*true/i.test(interactionBody)) {
      findings.push({
        severity: 'warning',
        rule: 'chart-index-without-shared-tooltip',
        line_number: lineNumberAt(text, interactionMatch.index),
        message: 'chartIndex is enabled without nearby tooltip.shared = true; linked series comparison may be incomplete'
      });
    }
    const tooltipItemsIndex = interactionBody.search(/\btooltip\s*:\s*\{[\s\S]{0,160}?items\s*:/i);
    if (tooltipItemsIndex >= 0) {
      findings.push({
        severity: 'warning',
        rule: 'tooltip-items-in-interaction',
        line_number: lineNumberAt(text, openBrace + tooltipItemsIndex),
        message: 'tooltip.items appears under interaction.tooltip; tooltip content should usually live on the mark tooltip field'
      });
    }
  }

  return findings;
}

function detectComponentConfigShapeIssues(text) {
  const findings = [];

  if (/\bslider\s*:\s*true/gi.test(text)) {
    const idx = text.search(/\bslider\s*:\s*true/i);
    findings.push({
      severity: 'warning',
      rule: 'slider-boolean-top-level',
      line_number: lineNumberAt(text, idx),
      message: 'slider is configured as bare boolean; use slider: { x: true } or slider: { y: true }'
    });
  }

  if (/\bscrollbar\s*:\s*true/gi.test(text)) {
    const idx = text.search(/\bscrollbar\s*:\s*true/i);
    findings.push({
      severity: 'warning',
      rule: 'scrollbar-boolean-top-level',
      line_number: lineNumberAt(text, idx),
      message: 'scrollbar is configured as bare boolean; use scrollbar: { x: true } or scrollbar: { y: true }'
    });
  }

  if (/\bslider\s*:\s*\{\s*(values|position|trackSize|handleIconFill|selectionFill)\s*:/gi.test(text)) {
    const idx = text.search(/\bslider\s*:\s*\{\s*(values|position|trackSize|handleIconFill|selectionFill)\s*:/i);
    findings.push({
      severity: 'warning',
      rule: 'slider-missing-axis-key',
      line_number: lineNumberAt(text, idx),
      message: 'slider config appears to omit x/y axis key; move slider options under slider.x or slider.y'
    });
  }

  if (/\bscrollbar\s*:\s*\{\s*(ratio|value|position|thumbFill|trackFill)\s*:/gi.test(text)) {
    const idx = text.search(/\bscrollbar\s*:\s*\{\s*(ratio|value|position|thumbFill|trackFill)\s*:/i);
    findings.push({
      severity: 'warning',
      rule: 'scrollbar-missing-axis-key',
      line_number: lineNumberAt(text, idx),
      message: 'scrollbar config appears to omit x/y axis key; move scrollbar options under scrollbar.x or scrollbar.y'
    });
  }

  if (/\bslider\s*:\s*\{[\s\S]{0,180}?[xy]\s*:\s*\{[\s\S]{0,120}?\bhandleFill\s*:/gi.test(text)) {
    const idx = text.search(/\bslider\s*:\s*\{[\s\S]{0,180}?[xy]\s*:\s*\{[\s\S]{0,120}?\bhandleFill\s*:/i);
    findings.push({
      severity: 'warning',
      rule: 'slider-invalid-handle-fill-key',
      line_number: lineNumberAt(text, idx),
      message: 'slider config uses handleFill; verify whether handleIconFill is the intended property'
    });
  }

  if (/\bscrollbar\s*:\s*\{[\s\S]{0,180}?[xy]\s*:\s*\{[\s\S]{0,120}?\bfill\s*:/gi.test(text)) {
    const idx = text.search(/\bscrollbar\s*:\s*\{[\s\S]{0,180}?[xy]\s*:\s*\{[\s\S]{0,120}?\bfill\s*:/i);
    findings.push({
      severity: 'warning',
      rule: 'scrollbar-invalid-fill-key',
      line_number: lineNumberAt(text, idx),
      message: 'scrollbar config uses raw fill; verify whether thumbFill or trackFill is the intended property'
    });
  }

  if (/\b(scrollbar|slider)\s*:\s*\{[\s\S]{0,180}?[xy]\s*:\s*\{[\s\S]{0,120}?\bstyle\s*:\s*\{/gi.test(text)) {
    const idx = text.search(/\b(scrollbar|slider)\s*:\s*\{[\s\S]{0,180}?[xy]\s*:\s*\{[\s\S]{0,120}?\bstyle\s*:\s*\{/i);
    findings.push({
      severity: 'warning',
      rule: 'component-style-wrapper-misuse',
      line_number: lineNumberAt(text, idx),
      message: 'slider or scrollbar style properties appear wrapped in style{}; verify whether the properties should be declared directly on the axis config'
    });
  }

  const sliderValuesPattern = /\bslider\s*:\s*\{[\s\S]{0,220}?[xy]\s*:\s*\{[\s\S]{0,140}?\bvalues\s*:\s*\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\]/gi;
  let match;
  while ((match = sliderValuesPattern.exec(text)) !== null) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (start < 0 || start > 1 || end < 0 || end > 1) {
      findings.push({
        severity: 'warning',
        rule: 'slider-values-out-of-range',
        line_number: lineNumberAt(text, match.index),
        message: 'slider values appear outside the [0, 1] range'
      });
    }
  }

  return findings;
}

function detectTooltipConfigIssues(text) {
  const findings = [];

  const renderPattern = /\btooltip\s*:\s*\{[\s\S]{0,260}?\brender\s*:\s*\([^)]*\)\s*=>\s*\{[\s\S]{0,220}?\}/gi;
  let match;
  while ((match = renderPattern.exec(text)) !== null) {
    const snippet = match[0];
    if (!/\breturn\b/.test(snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'tooltip-render-without-return',
        line_number: lineNumberAt(text, match.index),
        message: 'tooltip render function appears to use a block body without returning HTML'
      });
    }
  }

  const valueFormatterPattern = /\bvalueFormatter\s*:\s*['"]\.[^'"]*\s+[^\d'"]+['"]/gi;
  while ((match = valueFormatterPattern.exec(text)) !== null) {
    findings.push({
      severity: 'warning',
      rule: 'value-formatter-unit-string',
      line_number: lineNumberAt(text, match.index),
      message: 'valueFormatter appears to append units to a d3-format string; prefer a function formatter instead'
    });
  }

  const interactionTooltipArrayPattern = /\binteraction\s*:\s*\[[\s\S]{0,320}?\{\s*type\s*:\s*['"]tooltip['"][\s\S]{0,220}?\}/gi;
  while ((match = interactionTooltipArrayPattern.exec(text)) !== null) {
    const snippet = match[0];
    if (/\bitems\s*:/.test(snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'tooltip-items-in-interaction-array',
        line_number: lineNumberAt(text, match.index),
        message: 'tooltip items appear under interaction array tooltip config; tooltip content should usually live on the mark tooltip field'
      });
    }
    const renderBlock = snippet.match(/\brender\s*:\s*\([^)]*\)\s*=>\s*\{[\s\S]*\}/);
    if (renderBlock && !/\breturn\b/.test(renderBlock[0])) {
      findings.push({
        severity: 'warning',
        rule: 'interaction-tooltip-render-without-return',
        line_number: lineNumberAt(text, match.index),
        message: 'interaction tooltip render function appears to use a block body without returning HTML'
      });
    }
  }

  const tooltipBlockPattern = /\btooltip\s*:\s*\{/gi;
  while ((match = tooltipBlockPattern.exec(text)) !== null) {
    const block = findEnclosingObject(text, match.index, (snippet) => /\btooltip\s*:\s*\{/.test(snippet));
    if (!block) continue;
    const context = text.slice(Math.max(0, block.openBrace - 140), block.openBrace);
    const isInteractionScoped = /\binteraction\s*:\s*(\{|\[)[\s\S]{0,140}$/i.test(context);
    if (!isInteractionScoped && /\bcrosshairs(?:Stroke|LineWidth|LineDash)?\s*:/i.test(block.snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'tooltip-crosshairs-outside-interaction',
        line_number: lineNumberAt(text, match.index),
        message: 'tooltip crosshairs config appears outside interaction tooltip config'
      });
    }
    if (!isInteractionScoped && /\bcss\s*:\s*\{/i.test(block.snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'tooltip-css-outside-interaction',
        line_number: lineNumberAt(text, match.index),
        message: 'tooltip css config appears outside interaction tooltip config'
      });
    }
  }

  const tooltipFieldPattern = /\bitems\s*:\s*\[[\s\S]{0,220}?\bfield\s*:\s*['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]/gi;
  while ((match = tooltipFieldPattern.exec(text)) !== null) {
    const container = findEnclosingObject(text, match.index, (snippet) => /\btooltip\s*:\s*\{|\btype\s*:\s*['"]tooltip['"]/i.test(snippet));
    if (!container) continue;
    const parent = findEnclosingObject(text, container.openBrace - 1, (snippet) => /\bdata\s*:\s*\[/.test(snippet));
    if (!parent) continue;
    const dataMatches = [...parent.snippet.matchAll(/\bdata\s*:\s*\[\s*\{([\s\S]{0,260}?)\}\s*\]/gi)];
    if (dataMatches.length === 0) continue;
    const nearest = dataMatches[dataMatches.length - 1];
    const keys = new Set();
    const keyPattern = /([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g;
    let keyMatch;
    while ((keyMatch = keyPattern.exec(nearest[1])) !== null) {
      keys.add(keyMatch[1]);
    }
    if (keys.size > 0 && !keys.has(match[1])) {
      findings.push({
        severity: 'warning',
        rule: 'tooltip-field-mismatch-inline-data',
        line_number: lineNumberAt(text, match.index),
        message: `tooltip field '${match[1]}' was not found in nearby inline data keys`
      });
    }
  }

  return findings;
}

function detectStyleTooltipIssues(text) {
  const findings = [];
  const stylePattern = /\bstyle\s*:\s*\{/gi;
  let match;
  while ((match = stylePattern.exec(text)) !== null) {
    const openBrace = text.indexOf('{', match.index);
    const closeBrace = findMatching(text, openBrace, '{', '}');
    if (closeBrace === -1) continue;
    const styleBody = text.slice(openBrace, closeBrace + 1);
    if (/\btooltip\s*:\s*\{/i.test(styleBody)) {
      findings.push({
        severity: 'warning',
        rule: 'tooltip-in-style-object',
        line_number: lineNumberAt(text, match.index),
        message: 'tooltip config appears under style; move tooltip to mark tooltip or interaction.tooltip as appropriate'
      });
    }
  }
  return findings;
}

function detectAnnotationImageIssues(text) {
  const findings = [];
  let match;

  const imageStyleImgPattern = /\btype\s*:\s*['"]image['"][\s\S]{0,220}?\bstyle\s*:\s*\{[\s\S]{0,120}?\bimg\s*:/gi;
  while ((match = imageStyleImgPattern.exec(text)) !== null) {
    findings.push({
      severity: 'warning',
      rule: 'image-mark-style-img',
      line_number: lineNumberAt(text, match.index),
      message: 'image mark uses style.img; verify whether src should be bound through encode.src instead'
    });
  }

  const imageFunctionPosPattern = /\btype\s*:\s*['"]image['"][\s\S]{0,240}?\bencode\s*:\s*\{[\s\S]{0,160}?\bx\s*:\s*\(\)\s*=>[\s\S]{0,80}?\by\s*:\s*\(\)\s*=>/gi;
  while ((match = imageFunctionPosPattern.exec(text)) !== null) {
    findings.push({
      severity: 'warning',
      rule: 'image-mark-function-position',
      line_number: lineNumberAt(text, match.index),
      message: 'image mark appears to use function-based fixed positions; verify whether data-bound x/y with src is the intended pattern'
    });
  }

  const imageUrlWithoutSrcPattern = /\btype\s*:\s*['"]image['"][\s\S]{0,220}?\bdata\s*:\s*\[\s*\{[\s\S]{0,120}?\burl\s*:\s*['"][^'"]+['"][\s\S]{0,220}?\bencode\s*:\s*\{(?![\s\S]{0,120}?\bsrc\s*:)/gi;
  while ((match = imageUrlWithoutSrcPattern.exec(text)) !== null) {
    findings.push({
      severity: 'warning',
      rule: 'image-mark-missing-src-encode',
      line_number: lineNumberAt(text, match.index),
      message: 'image mark data uses url but encode.src was not found nearby'
    });
  }

  const imageSrcBtoaPattern = /\btype\s*:\s*['"]image['"][\s\S]{0,220}?\bencode\s*:\s*\{[\s\S]{0,140}?\bsrc\s*:\s*btoa\s*\(/gi;
  while ((match = imageSrcBtoaPattern.exec(text)) !== null) {
    findings.push({
      severity: 'warning',
      rule: 'image-mark-btoa-src',
      line_number: lineNumberAt(text, match.index),
      message: 'image mark src appears to use btoa(...); verify that a real URL or full data URL is provided instead'
    });
  }

  const imageMissingSizePattern = /\btype\s*:\s*['"]image['"][\s\S]{0,260}?\bencode\s*:\s*\{[\s\S]{0,180}?\bsrc\s*:(?![\s\S]{0,120}?\bsize\s*:)[\s\S]{0,220}?(?![\s\S]{0,140}?\bstyle\s*:\s*\{[\s\S]{0,80}?\b(width|height)\s*:)/gi;
  while ((match = imageMissingSizePattern.exec(text)) !== null) {
    findings.push({
      severity: 'info',
      rule: 'image-mark-missing-size',
      line_number: lineNumberAt(text, match.index),
      message: 'image mark appears to omit size or width/height; verify that image dimensions are intentionally controlled'
    });
  }

  const imageMarkPattern = /\btype\s*:\s*['"]image['"]/gi;
  while ((match = imageMarkPattern.exec(text)) !== null) {
    const block = findEnclosingObject(text, match.index, (snippet) => /\btype\s*:\s*['"]image['"]/i.test(snippet));
    if (!block) continue;
    if (!/\bencode\s*:\s*\{[\s\S]{0,160}?\bsrc\s*:/i.test(block.snippet) && !/\bstyle\s*:\s*\{[\s\S]{0,120}?\bimg\s*:/i.test(block.snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'image-mark-missing-src',
        line_number: lineNumberAt(text, match.index),
        message: 'image mark does not appear to define an image source through encode.src'
      });
    }
  }

  return findings;
}

function detectRangeMarkIssues(text) {
  const findings = [];
  let match;

  const rangeWithX1Y1Pattern = /\btype\s*:\s*['"]range['"][\s\S]{0,260}?\bencode\s*:\s*\{[\s\S]{0,160}?\bx1\s*:|\\btype\s*:\s*['"]range['"][\s\S]{0,260}?\bencode\s*:\s*\{[\s\S]{0,160}?\by1\s*:/gi;
  while ((match = rangeWithX1Y1Pattern.exec(text)) !== null) {
    findings.push({
      severity: 'warning',
      rule: 'range-mark-x1-y1-misuse',
      line_number: lineNumberAt(text, match.index),
      message: 'range mark appears to use x1/y1 encode fields; verify whether x and y arrays should be used instead'
    });
  }

  const rangeAxisPattern = /\btype\s*:\s*['"](rangeX|rangeY)['"]/gi;
  while ((match = rangeAxisPattern.exec(text)) !== null) {
    const block = findEnclosingObject(text, match.index, (snippet) => /\btype\s*:\s*['"](rangeX|rangeY)['"]/i.test(snippet));
    const snippet = block ? block.snippet : text.slice(match.index, match.index + 420);
    const hasEncode = /\bencode\s*:\s*\{/.test(snippet);
    if (!hasEncode) {
      findings.push({
        severity: 'warning',
        rule: `${String(match[1]).toLowerCase()}-missing-encode`,
        line_number: lineNumberAt(text, match.index),
        message: `${match[1]} appears to define data without explicit encode mapping`
      });
      continue;
    }

    if (/rangeX/i.test(match[1]) && !/\bx1\s*:/.test(snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'rangex-missing-x1',
        line_number: lineNumberAt(text, match.index),
        message: 'rangeX encode appears to define x without x1'
      });
    }

    if (/rangeY/i.test(match[1]) && !/\by1\s*:/.test(snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'rangey-missing-y1',
        line_number: lineNumberAt(text, match.index),
        message: 'rangeY encode appears to define y without y1'
      });
    }
  }

  return findings;
}

function detectLabelTextIssues(text) {
  const findings = [];
  const pattern = /\blabels\s*:\s*\[[\s\S]{0,220}?\btext\s*:\s*(-?\d+(?:\.\d+)?)/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    findings.push({
      severity: 'warning',
      rule: 'label-text-numeric-constant',
      line_number: lineNumberAt(text, match.index),
      message: 'labels[].text appears to be a numeric constant; verify whether a field name or formatter function was intended'
    });
  }
  return findings;
}

function detectTextMarkIssues(text) {
  const findings = [];
  const pattern = /\btype\s*:\s*['"]text['"][\s\S]{0,240}?\b(encode\s*:\s*\{[\s\S]{0,160}?\}|style\s*:\s*\{[\s\S]{0,160}?\})/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const snippet = match[0];
    const hasEncodeText = /\bencode\s*:\s*\{[\s\S]{0,160}?\btext\s*:/i.test(snippet);
    const hasStyleText = /\bstyle\s*:\s*\{[\s\S]{0,160}?\btext\s*:/i.test(snippet);
    if (!hasEncodeText && !hasStyleText) {
      findings.push({
        severity: 'warning',
        rule: 'text-mark-missing-text-source',
        line_number: lineNumberAt(text, match.index),
        message: 'text mark does not appear to define encode.text or style.text'
      });
    }
  }

  const textMarkPattern = /\btype\s*:\s*['"]text['"]/gi;
  while ((match = textMarkPattern.exec(text)) !== null) {
    const block = findEnclosingObject(text, match.index, (snippet) => /\btype\s*:\s*['"]text['"]/i.test(snippet));
    if (!block) continue;
    if (/\bdata\s*:/.test(block.snippet)) continue;
    const parentView = findEnclosingObject(text, block.openBrace - 1, (snippet) => /\btype\s*:\s*['"]view['"]/i.test(snippet));
    const parentHasData = parentView && /\bdata\s*:/.test(parentView.snippet);
    if (!parentHasData) {
      findings.push({
        severity: 'warning',
        rule: 'text-mark-missing-data',
        line_number: lineNumberAt(text, match.index),
        message: 'text mark does not appear to have its own data or inherit data from a parent view'
      });
    }
  }
  return findings;
}

function detectMarkSpecificIssues(text) {
  const findings = [];
  const markPattern = /\btype\s*:\s*['"](lineX|lineY|rangeX|rangeY|text)['"]/gi;
  let match;
  while ((match = markPattern.exec(text)) !== null) {
    const markType = match[1];
    const block = findEnclosingObject(text, match.index, (snippet) => new RegExp(`\\btype\\s*:\\s*['"]${markType}['"]`, 'i').test(snippet));
    if (!block) continue;
    const keys = collectInlineObjectKeys(block.snippet);
    if (keys.size === 0) continue;

    if (/lineX/i.test(markType)) {
      if (!/\bencode\s*:\s*\{[\s\S]{0,120}?\bx\s*:/i.test(block.snippet)) {
        findings.push({
          severity: 'warning',
          rule: 'linex-missing-encode-x',
          line_number: lineNumberAt(text, match.index),
          message: 'lineX mark does not appear to define encode.x'
        });
      }
      const field = extractEncodeField(block.snippet, 'x');
      if (field && !keys.has(field)) {
        findings.push({
          severity: 'warning',
          rule: 'linex-encode-field-mismatch',
          line_number: lineNumberAt(text, match.index),
          message: `lineX encode.x references '${field}' which was not found in nearby inline data keys`
        });
      }
    }

    if (/lineY/i.test(markType)) {
      if (!/\bencode\s*:\s*\{[\s\S]{0,120}?\by\s*:/i.test(block.snippet)) {
        findings.push({
          severity: 'warning',
          rule: 'liney-missing-encode-y',
          line_number: lineNumberAt(text, match.index),
          message: 'lineY mark does not appear to define encode.y'
        });
      }
      const field = extractEncodeField(block.snippet, 'y');
      if (field && !keys.has(field)) {
        findings.push({
          severity: 'warning',
          rule: 'liney-encode-field-mismatch',
          line_number: lineNumberAt(text, match.index),
          message: `lineY encode.y references '${field}' which was not found in nearby inline data keys`
        });
      }
    }

    if (/rangeX/i.test(markType)) {
      const xField = extractEncodeField(block.snippet, 'x');
      const x1Field = extractEncodeField(block.snippet, 'x1');
      if (xField && !keys.has(xField)) {
        findings.push({
          severity: 'warning',
          rule: 'rangex-encode-field-mismatch',
          line_number: lineNumberAt(text, match.index),
          message: `rangeX encode.x references '${xField}' which was not found in nearby inline data keys`
        });
      }
      if (x1Field && !keys.has(x1Field)) {
        findings.push({
          severity: 'warning',
          rule: 'rangex-encode-field-mismatch',
          line_number: lineNumberAt(text, match.index),
          message: `rangeX encode.x1 references '${x1Field}' which was not found in nearby inline data keys`
        });
      }
    }

    if (/rangeY/i.test(markType)) {
      const yField = extractEncodeField(block.snippet, 'y');
      const y1Field = extractEncodeField(block.snippet, 'y1');
      if (yField && !keys.has(yField)) {
        findings.push({
          severity: 'warning',
          rule: 'rangey-encode-field-mismatch',
          line_number: lineNumberAt(text, match.index),
          message: `rangeY encode.y references '${yField}' which was not found in nearby inline data keys`
        });
      }
      if (y1Field && !keys.has(y1Field)) {
        findings.push({
          severity: 'warning',
          rule: 'rangey-encode-field-mismatch',
          line_number: lineNumberAt(text, match.index),
          message: `rangeY encode.y1 references '${y1Field}' which was not found in nearby inline data keys`
        });
      }
    }

    if (/text/i.test(markType)) {
      const textField = extractEncodeField(block.snippet, 'text');
      if (textField && !keys.has(textField)) {
        findings.push({
          severity: 'warning',
          rule: 'textmark-encode-text-mismatch',
          line_number: lineNumberAt(text, match.index),
          message: `text mark encode.text references '${textField}' which was not found in nearby inline data keys`
        });
      }
    }
  }

  return findings;
}

function dedupeFindings(findings) {
  const seen = new Set();
  return findings.filter((item) => {
    const key = [item.rule, item.line_number, item.message].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function analyzeChartSpec(targetDir, options = {}) {
  const target = buildTargetFiles(targetDir, options);
  const findings = [];
  let scannedFiles = 0;

  for (const file of target.files) {
    const rel = relativeTo(target.root, file);
    if (!isChartCodeFile(rel)) continue;
    const text = readText(file);
    if (!text || !/\bnew\s+Chart\s*\(|@antv\/g2|chart\.options\s*\(|antv-studio\.alipay\.com\/api\/gpt-vis/i.test(text)) continue;

    scannedFiles += 1;
    const fileFindings = dedupeFindings([
      ...detectMissingContainer(text),
      ...detectChartVariableIssues(text),
      ...detectRegexFindings(text),
      ...detectTransformArrayIssues(text),
      ...detectLabelTransformIssues(text),
      ...detectDataTransformPlacement(text),
      ...detectNestedViewUsage(text),
      ...detectViewContainerIssues(text),
      ...detectRenderApiPayloadIssues(text),
      ...detectInteractionDependencyIssues(text),
      ...detectComponentConfigShapeIssues(text),
      ...detectTooltipConfigIssues(text),
      ...detectStyleTooltipIssues(text),
      ...detectAnnotationImageIssues(text),
      ...detectRangeMarkIssues(text),
      ...detectLabelTextIssues(text),
      ...detectTextMarkIssues(text),
      ...detectMarkSpecificIssues(text)
    ]).map((item) => ({
      severity: item.severity,
      file: rel,
      line_number: item.line_number,
      rule: item.rule,
      message: item.message
    }));

    findings.push(...fileFindings);
  }

  const filesWithFindings = new Set(findings.map((item) => item.file)).size;

  return {
    tool: 'verify-chart-spec',
    target: targetDir,
    summary: `Scanned ${scannedFiles} chart-related files and found ${findings.length} heuristic chart-spec findings across ${filesWithFindings} files.`,
    findings,
    hotspots: summarizeIssueHotspots(findings),
    stats: {
      scannedFiles,
      findings: findings.length,
      filesWithFindings
    },
    nextSteps: [
      'fix error-level findings before chart rendering or code generation reuse',
      'review warning-level findings against local chart wrappers or abstractions',
      'run the chart after repair to confirm runtime and visual behavior'
    ]
  };
}

module.exports = {
  analyzeChartSpec
};
