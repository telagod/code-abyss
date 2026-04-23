'use strict';

const fs = require('fs');
const path = require('path');
const { classifyPath, listChangedFiles } = require('./runtime');

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java', '.rs', '.c', '.cpp', '.h']);
const TEST_PATTERNS = ['test_', '_test.', '.test.', 'spec_', '_spec.', '/tests/', '/test/', '/__tests__/'];
const MODULE_MARKERS = [
  'README.md',
  'DESIGN.md',
  'package.json',
  'pyproject.toml',
  'go.mod',
  'Cargo.toml',
  'pom.xml',
  'manifest.json'
];
const CHANGE_SENSITIVE_PATTERNS = [
  { label: 'auth', pattern: /(auth|login|token|session|permission|rbac|oauth|jwt)/i },
  { label: 'database', pattern: /(migrat|schema|model|sql|query|repository|dao)/i },
  { label: 'execution', pattern: /(exec|shell|command|subprocess|worker|job)/i },
  { label: 'public-api', pattern: /(api|handler|controller|route|graphql|rpc)/i },
  { label: 'config', pattern: /(config|settings|env|deploy|pipeline|workflow)/i },
  { label: 'security', pattern: /(secret|credential|key|encrypt|decrypt|cors|csrf|xss|ssrf)/i }
];

function extOf(file) {
  return path.extname(file).toLowerCase();
}

function isCodePath(relPath) {
  return CODE_EXTENSIONS.has(extOf(relPath));
}

function isTestPath(relPath) {
  const lower = relPath.toLowerCase();
  return TEST_PATTERNS.some(pattern => lower.includes(pattern));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function findModuleFor(relPath, targetDir) {
  const parts = relPath.split('/').filter(Boolean);
  if (parts.length <= 1) return '.';

  for (let i = parts.length - 1; i >= 1; i -= 1) {
    const candidate = parts.slice(0, i).join('/');
    if (MODULE_MARKERS.some(marker => fs.existsSync(path.join(targetDir, candidate, marker)))) {
      return candidate;
    }
  }
  return parts[0];
}

function identifyModulesFromChanges(changeSet, targetDir) {
  const modules = new Set();
  for (const relPath of changeSet.files) {
    modules.add(findModuleFor(relPath, targetDir));
  }
  return [...modules];
}

function buildDocSync(changeSet, targetDir) {
  const docPaths = new Set(changeSet.files.filter(file => classifyPath(file) === 'doc'));
  const issues = [];
  const moduleDetails = {};
  const modules = identifyModulesFromChanges(changeSet, targetDir);

  for (const mod of modules) {
    const prefix = mod === '.' ? '' : `${mod}/`;
    const moduleFiles = changeSet.files.filter(file => mod === '.' ? !file.includes('/') : file === mod || file.startsWith(prefix));
    const codeFiles = moduleFiles.filter(file => isCodePath(file) && !isTestPath(file));
    if (!codeFiles.length) continue;

    const readmePath = `${prefix}README.md`;
    const designPath = `${prefix}DESIGN.md`;
    const hasReadmeUpdate = docPaths.has(readmePath);
    const hasDesignUpdate = docPaths.has(designPath);

    moduleDetails[mod] = {
      codeFiles: codeFiles.length,
      hasReadmeUpdate,
      hasDesignUpdate
    };

    if (codeFiles.length >= 2 && !hasDesignUpdate) {
      issues.push({
        severity: 'warning',
        message: `module '${mod}' changed code in multiple files but DESIGN.md was not updated`
      });
    } else if (!hasReadmeUpdate) {
      issues.push({
        severity: 'info',
        message: `module '${mod}' changed code without README.md update`
      });
    }
  }

  return { modules, moduleDetails, issues };
}

function classifySensitiveChangeSurface(files) {
  const hits = [];
  for (const file of files) {
    for (const probe of CHANGE_SENSITIVE_PATTERNS) {
      if (probe.pattern.test(file)) hits.push(probe.label);
    }
  }
  return unique(hits);
}

function buildChangeRisk(changeSet, counts, modules, sensitiveAreas) {
  let score = 0;
  const changeKinds = summarizeChangeKinds(changeSet.entries);

  if (changeSet.files.length >= 12) score += 2;
  if (changeSet.files.length >= 25) score += 2;
  if ((counts.code || 0) >= 5) score += 2;
  if ((counts.config || 0) > 0) score += 2;
  if (modules.length >= 3) score += 2;
  if ((changeKinds.deleted || 0) > 0) score += 2;
  if ((changeKinds.renamed || 0) > 0) score += 1;

  for (const area of sensitiveAreas) {
    if (area === 'auth' || area === 'execution' || area === 'security') score += 3;
    else score += 1;
  }

  let level = 'low';
  if (score >= 4) level = 'medium';
  if (score >= 8) level = 'high';
  if (score >= 12) level = 'critical';

  const recommendedChecks = [];
  if ((counts.code || 0) > 0) recommendedChecks.push('targeted tests');
  if ((counts.code || 0) > 0 && modules.length >= 2) recommendedChecks.push('review');
  if ((counts.config || 0) > 0 || level === 'high' || level === 'critical') recommendedChecks.push('ship');
  if ((changeKinds.deleted || 0) > 0 || (changeKinds.renamed || 0) > 0) recommendedChecks.push('review');
  if (sensitiveAreas.some(area => ['auth', 'execution', 'security'].includes(area))) {
    recommendedChecks.push('verify-security');
  }
  if ((counts.code || 0) > 0) recommendedChecks.push('verify-quality');

  return {
    level,
    score,
    sensitiveAreas,
    recommendedChecks: unique(recommendedChecks)
  };
}

function summarizeChangeKinds(entries) {
  const summary = { added: 0, modified: 0, deleted: 0, renamed: 0 };
  for (const entry of Array.isArray(entries) ? entries : []) {
    if (entry.operation && summary[entry.operation] != null) {
      summary[entry.operation] += 1;
    }
  }
  return summary;
}

function findOperationEntries(entries, predicate) {
  return (Array.isArray(entries) ? entries : []).filter(predicate);
}

function resolveAnalyzeChangeOptions(modeOrOptions, maybeOptions) {
  if (modeOrOptions && typeof modeOrOptions === 'object') {
    return {
      mode: modeOrOptions.mode || 'working',
      changedFiles: modeOrOptions.changedFiles || []
    };
  }

  return {
    mode: modeOrOptions || 'working',
    changedFiles: maybeOptions && maybeOptions.changedFiles ? maybeOptions.changedFiles : []
  };
}

function analyzeChange(targetDir, modeOrOptions, maybeOptions = {}) {
  const options = resolveAnalyzeChangeOptions(modeOrOptions, maybeOptions);
  const changeSet = listChangedFiles(targetDir, options.mode, { changedFiles: options.changedFiles });
  const counts = { code: 0, doc: 0, test: 0, config: 0, asset: 0, other: 0 };
  const findings = [];
  const changeKinds = summarizeChangeKinds(changeSet.entries);

  for (const file of changeSet.files) {
    const kind = classifyPath(file);
    counts[kind] = (counts[kind] || 0) + 1;
  }

  if (changeSet.source === 'no-git') {
    findings.push({ severity: 'info', message: 'git repository was not detected; change analysis is limited' });
  }
  if (changeSet.source === 'git-permission-denied') {
    findings.push({ severity: 'info', message: 'git process could not be spawned (EPERM); provide --changed-files or PSS_CHANGED_FILES as fallback' });
  }
  if (changeSet.source === 'git-failed') {
    findings.push({ severity: 'info', message: 'git metadata could not be read; change analysis is limited' });
  }
  if (changeSet.source === 'external-arg') {
    findings.push({ severity: 'info', message: 'using externally supplied changed files from --changed-files' });
  }
  if (changeSet.source === 'external-env-no-git' || changeSet.source === 'external-env-git-eperm') {
    findings.push({ severity: 'info', message: 'using externally supplied changed files from environment fallback' });
  }
  if (changeSet.files.length === 0) {
    findings.push({ severity: 'info', message: 'no changed files were detected for the selected target scope' });
  }
  if (counts.code > 0 && counts.test === 0) {
    findings.push({ severity: 'warning', message: 'code changed but no test files changed' });
  }
  if (changeKinds.deleted > 0 && counts.test === 0) {
    findings.push({ severity: 'warning', message: 'files were deleted but no replacement tests or docs were detected in scope' });
  }
  if (counts.code > 0 && counts.doc === 0) {
    findings.push({ severity: 'info', message: 'code changed but no documentation files changed' });
  }
  if (counts.config > 0 && counts.doc === 0) {
    findings.push({ severity: 'info', message: 'config changed; consider updating operational notes' });
  }

  const docSync = buildDocSync(changeSet, targetDir);
  findings.push(...docSync.issues);
  const sensitiveAreas = classifySensitiveChangeSurface(changeSet.files);
  const riskSummary = buildChangeRisk(changeSet, counts, docSync.modules, sensitiveAreas);
  const deletedTests = findOperationEntries(changeSet.entries, entry => entry.operation === 'deleted' && isTestPath(entry.file));
  const renamedPublicApi = findOperationEntries(
    changeSet.entries,
    entry => entry.operation === 'renamed' && /(api|handler|controller|route|graphql|rpc)/i.test(entry.file)
  );
  const deletedConfig = findOperationEntries(changeSet.entries, entry => entry.operation === 'deleted' && classifyPath(entry.file) === 'config');

  if (docSync.modules.length >= 3) {
    findings.push({ severity: 'warning', message: `change spans ${docSync.modules.length} modules; integration risk is elevated` });
  }
  if (deletedTests.length > 0) {
    findings.push({ severity: 'warning', message: `${deletedTests.length} test-like files were deleted; confirm replacement coverage exists` });
  }
  if (renamedPublicApi.length > 0) {
    findings.push({ severity: 'warning', message: `${renamedPublicApi.length} public API path(s) were renamed; compatibility and caller impact should be reviewed` });
  }
  if (deletedConfig.length > 0) {
    findings.push({ severity: 'warning', message: `${deletedConfig.length} config file(s) were removed; rollback and environment assumptions should be reviewed` });
  }
  if (sensitiveAreas.length > 0) {
    findings.push({ severity: riskSummary.level === 'critical' || riskSummary.level === 'high' ? 'warning' : 'info', message: `sensitive change surface detected: ${sensitiveAreas.join(', ')}` });
  }
  if ((counts.config || 0) > 0 && riskSummary.level !== 'low') {
    findings.push({ severity: 'info', message: 'config or release-surface changes suggest rollback and deployment notes should be reviewed' });
  }

  return {
    tool: 'verify-change',
    target: targetDir,
    mode: options.mode,
    summary: `Analyzed ${changeSet.files.length} changed files from ${changeSet.source}.`,
    findings,
    changedFiles: changeSet.files.slice(0, 100),
    changeKinds,
    counts,
    affectedModules: docSync.modules,
    moduleDetails: docSync.moduleDetails,
    changedEntries: (changeSet.entries || []).slice(0, 100),
    riskSummary,
    nextSteps: [
      'review affected modules',
      'decide whether docs or tests must change',
      'confirm rollback impact for config-heavy diffs',
      ...riskSummary.recommendedChecks.map(check => `consider ${check}`)
    ]
  };
}

module.exports = {
  analyzeChange,
  classifySensitiveChangeSurface,
  buildChangeRisk
};
