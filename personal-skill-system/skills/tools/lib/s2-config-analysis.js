'use strict';

const fs = require('fs');
const path = require('path');
const { walkFiles, readText, relativeTo, classifyPath } = require('./runtime');
const { summarizeIssueHotspots } = require('./quality-analysis');

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.vue']);

function extOf(file) {
  return path.extname(file).toLowerCase();
}

function isS2CodeFile(relPath) {
  return classifyPath(relPath) === 'code' && CODE_EXTENSIONS.has(extOf(relPath));
}

function lineNumberAt(text, index) {
  return String(text.slice(0, index)).split(/\r?\n/).length;
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

function detectSheetComponentIssues(text) {
  const findings = [];
  const componentPattern = /<SheetComponent\b[\s\S]{0,800}?(\/>|<\/SheetComponent>)/gi;
  let match;
  while ((match = componentPattern.exec(text)) !== null) {
    const snippet = match[0];
    if (!/\bdataCfg\s*=/.test(snippet)) {
      findings.push({
        severity: 'error',
        rule: 'sheetcomponent-missing-datacfg',
        line_number: lineNumberAt(text, match.index),
        message: 'SheetComponent appears to be missing required dataCfg prop'
      });
    }
    if (!/\boptions\s*=/.test(snippet)) {
      findings.push({
        severity: 'error',
        rule: 'sheetcomponent-missing-options',
        line_number: lineNumberAt(text, match.index),
        message: 'SheetComponent appears to be missing required options prop'
      });
    }
    if (/\bshowPagination\s*=/.test(snippet) && /\boptions\s*=\s*\{\{/.test(snippet) && !/\bpagination\s*:/.test(snippet)) {
      findings.push({
        severity: 'warning',
        rule: 'showpagination-without-pagination',
        line_number: lineNumberAt(text, match.index),
        message: 'SheetComponent enables showPagination but inline options do not declare pagination'
      });
    }

    if (/\bsheetType\s*=\s*["']table["']/.test(snippet) && /\bdataCfg\s*=\s*\{\{/.test(snippet)) {
      const fieldsBlock = snippet.match(/\bdataCfg\s*=\s*\{\{[\s\S]{0,400}?\bfields\s*:\s*\{([\s\S]{0,200}?)\}/);
      if (fieldsBlock && !/\bcolumns\s*:/.test(fieldsBlock[1])) {
        findings.push({
          severity: 'warning',
          rule: 'table-sheet-inline-missing-columns',
          line_number: lineNumberAt(text, match.index),
          message: 'SheetComponent with sheetType=\"table\" has inline dataCfg.fields without columns'
        });
      }
    }

    if (/\bsheetType\s*=\s*["']pivot["']/.test(snippet) && /\bdataCfg\s*=\s*\{\{/.test(snippet)) {
      const fieldsBlock = snippet.match(/\bdataCfg\s*=\s*\{\{[\s\S]{0,400}?\bfields\s*:\s*\{([\s\S]{0,240}?)\}/);
      if (fieldsBlock && !/\bvalues\s*:/.test(fieldsBlock[1])) {
        findings.push({
          severity: 'warning',
          rule: 'pivot-sheet-inline-missing-values',
          line_number: lineNumberAt(text, match.index),
          message: 'SheetComponent with sheetType=\"pivot\" has inline dataCfg.fields without values'
        });
      }
    }
  }
  return findings;
}

function detectFieldShapeIssues(text) {
  const findings = [];
  const scalarRules = [
    { key: 'rows', rule: 's2-fields-rows-not-array' },
    { key: 'columns', rule: 's2-fields-columns-not-array' },
    { key: 'values', rule: 's2-fields-values-not-array' }
  ];

  for (const entry of scalarRules) {
    const pattern = new RegExp(`\\b${entry.key}\\s*:\\s*['"][^'"]+['"]`, 'gi');
    let match;
    while ((match = pattern.exec(text)) !== null) {
      findings.push({
        severity: 'error',
        rule: entry.rule,
        line_number: lineNumberAt(text, match.index),
        message: `S2 fields.${entry.key} appears to be configured as scalar instead of array`
      });
    }
  }

  const fieldsPattern = /\bfields\s*:\s*\{[\s\S]{0,400}?\}/gi;
  let fieldsMatch;
  while ((fieldsMatch = fieldsPattern.exec(text)) !== null) {
    const snippet = fieldsMatch[0];
    const hasRows = /\brows\s*:/.test(snippet);
    const hasColumns = /\bcolumns\s*:/.test(snippet);
    const hasValues = /\bvalues\s*:/.test(snippet);
    if (hasRows && !hasValues) {
      findings.push({
        severity: 'warning',
        rule: 's2-pivot-like-fields-missing-values',
        line_number: lineNumberAt(text, fieldsMatch.index),
        message: 'S2 fields block looks pivot-like but does not declare values'
      });
    }
  }

  return findings;
}

function detectImperativeLifecycleIssues(text) {
  const findings = [];
  const constructors = ['PivotSheet', 'TableSheet', 'SpreadSheet'];
  for (const ctor of constructors) {
    const pattern = new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][A-Za-z0-9_$]*)\\s*=\\s*new\\s+${ctor}\\s*\\(`, 'g');
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const variable = match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const destroyPattern = new RegExp(`\\b${variable}\\.destroy\\s*\\(`);
      if (!destroyPattern.test(text)) {
        findings.push({
          severity: 'warning',
          rule: 's2-imperative-missing-destroy',
          line_number: lineNumberAt(text, match.index),
          message: `${ctor} instance '${match[1]}' has no visible destroy() cleanup`
        });
      }
      const renderPattern = new RegExp(`\\b${variable}\\.render\\s*\\(`);
      if (!renderPattern.test(text)) {
        findings.push({
          severity: 'warning',
          rule: 's2-imperative-missing-render',
          line_number: lineNumberAt(text, match.index),
          message: `${ctor} instance '${match[1]}' has no visible render() call`
        });
      }
    }
  }
  return findings;
}

function analyzeS2Config(targetDir, options = {}) {
  const target = buildTargetFiles(targetDir, options);
  const findings = [];
  let scannedFiles = 0;

  for (const file of target.files) {
    const rel = relativeTo(target.root, file);
    if (!isS2CodeFile(rel)) continue;
    const text = readText(file);
    if (!text || !/@antv\/s2|SheetComponent|PivotSheet|TableSheet|S2DataConfig/.test(text)) continue;

    scannedFiles += 1;
    const fileFindings = [
      ...detectSheetComponentIssues(text),
      ...detectFieldShapeIssues(text),
      ...detectImperativeLifecycleIssues(text)
    ].map(item => ({
      ...item,
      file: rel
    }));
    findings.push(...fileFindings);
  }

  return {
    tool: 'verify-s2-config',
    target: targetDir,
    summary: `Scanned ${scannedFiles} S2-related files and found ${findings.length} heuristic S2 config findings.`,
    findings,
    hotspots: summarizeIssueHotspots(findings),
    stats: {
      scannedFiles,
      findings: findings.length
    },
    nextSteps: [
      'fix error-level field-shape and SheetComponent prop findings first',
      'review lifecycle cleanup and pagination wiring warnings',
      'validate final behavior against actual S2 rendering'
    ]
  };
}

module.exports = {
  analyzeS2Config
};
