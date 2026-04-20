'use strict';

const { analyzeChange } = require('./change-analysis');
const { analyzeQuality } = require('./quality-analysis');
const { analyzeSecurity } = require('./security-analysis');

function normalizeRelPath(file) {
  return String(file || '').replace(/\\/g, '/');
}

function buildChangedFileSet(changedFiles) {
  return new Set((Array.isArray(changedFiles) ? changedFiles : []).map(normalizeRelPath).filter(Boolean));
}

function issueTouchesChangedFiles(issue, changedFileSet) {
  if (!issue || !issue.file) return false;
  if (!changedFileSet || changedFileSet.size === 0) return false;
  return changedFileSet.has(normalizeRelPath(issue.file));
}

function splitFindingsByChangedFiles(items, changedFiles) {
  const changedFileSet = buildChangedFileSet(changedFiles);
  const scoped = [];
  const debt = [];

  for (const item of Array.isArray(items) ? items : []) {
    if (issueTouchesChangedFiles(item, changedFileSet)) scoped.push(item);
    else debt.push(item);
  }

  return {
    scoped,
    debt,
    scopedWarnings: scoped.filter(item => item.severity === 'warning'),
    scopedHighRisk: scoped.filter(item => item.severity === 'high' || item.severity === 'critical')
  };
}

function buildRemediations(blockers) {
  const advice = [];
  for (const blocker of blockers) {
    if (/test/i.test(blocker)) advice.push('add or update tests for the changed behavior');
    if (/quality/i.test(blocker)) advice.push('fix warning-level quality issues in changed files or narrow the change');
    if (/security/i.test(blocker)) advice.push('triage high-risk security findings in the changed surface before merge');
    if (/change analysis/i.test(blocker)) advice.push('resolve docs, config, or multi-module change warnings before merge');
  }
  return [...new Set(advice)];
}

function evaluatePreCommit(targetDir, options = {}) {
  const change = analyzeChange(targetDir, { mode: 'working', changedFiles: options.changedFiles });
  const quality = analyzeQuality(targetDir, options);
  const qualitySplit = splitFindingsByChangedFiles(quality.issues, change.changedFiles);
  const blockers = [];

  if (change.findings.some(item => item.severity === 'warning' && /no test files changed/.test(item.message))) {
    blockers.push('code changed without any accompanying test changes');
  }
  if (qualitySplit.scopedWarnings.length > 0) {
    blockers.push('quality scan reported warning-level issues in changed files');
  }

  return {
    guard: 'pre-commit-gate',
    target: targetDir,
    summary: blockers.length ? 'Pre-commit gate would block the change.' : 'Pre-commit gate would pass with changed-surface checks.',
    status: blockers.length ? 'block' : 'pass',
    blockers,
    remediations: buildRemediations(blockers),
    detail: {
      changeSummary: change.counts,
      changeKinds: change.changeKinds,
      changedFiles: change.changedFiles.length,
      qualityIssuesInChangedFiles: qualitySplit.scoped.length,
      qualityWarningsInChangedFiles: qualitySplit.scopedWarnings.length,
      qualityDebtOutsideChangedFiles: qualitySplit.debt.length,
      qualityIssuesTotal: quality.issues.length
    }
  };
}

function evaluatePreMerge(targetDir, options = {}) {
  const change = analyzeChange(targetDir, { mode: 'working', changedFiles: options.changedFiles });
  const quality = analyzeQuality(targetDir, options);
  const security = analyzeSecurity(targetDir, options);
  const qualitySplit = splitFindingsByChangedFiles(quality.issues, change.changedFiles);
  const securitySplit = splitFindingsByChangedFiles(security.findings, change.changedFiles);
  const blockers = [];

  const securitySignals = change.changedFiles.length > 0 ? securitySplit.scopedHighRisk : security.findings.filter(item => item.severity === 'high' || item.severity === 'critical');
  if (securitySignals.length > 0) {
    blockers.push('security scan reported high or critical findings in the changed surface');
  }
  if (qualitySplit.scopedWarnings.length > 0) {
    blockers.push('quality scan reported warning-level issues in changed files');
  }
  if (change.findings.some(item => item.severity === 'warning')) {
    blockers.push('change analysis reported unresolved warning-level concerns');
  }

  return {
    guard: 'pre-merge-gate',
    target: targetDir,
    summary: blockers.length ? 'Pre-merge gate would block the change.' : 'Pre-merge gate would pass with changed-surface checks.',
    status: blockers.length ? 'block' : 'pass',
    blockers,
    remediations: buildRemediations(blockers),
    detail: {
      changeSummary: change.counts,
      changeKinds: change.changeKinds,
      changedFiles: change.changedFiles.length,
      qualityIssuesInChangedFiles: qualitySplit.scoped.length,
      qualityWarningsInChangedFiles: qualitySplit.scopedWarnings.length,
      qualityDebtOutsideChangedFiles: qualitySplit.debt.length,
      qualityIssuesTotal: quality.issues.length,
      securityFindingsInChangedFiles: securitySplit.scoped.length,
      securityWarningsOutsideChangedFiles: securitySplit.debt.length
    }
  };
}

module.exports = {
  splitFindingsByChangedFiles,
  evaluatePreCommit,
  evaluatePreMerge
};
