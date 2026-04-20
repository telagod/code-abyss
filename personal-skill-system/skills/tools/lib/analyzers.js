#!/usr/bin/env node
'use strict';

const { generateDocs, analyzeModule } = require('./doc-module-analysis');
const { analyzeChange } = require('./change-analysis');
const { analyzeChartSpec } = require('./chart-spec-analysis');
const { analyzeQuality } = require('./quality-analysis');
const { analyzeSecurity } = require('./security-analysis');
const { analyzeS2Config } = require('./s2-config-analysis');

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

function splitQualityIssues(issues, changedFiles) {
  const changedFileSet = buildChangedFileSet(changedFiles);
  const scoped = [];
  const debt = [];

  for (const issue of Array.isArray(issues) ? issues : []) {
    if (issueTouchesChangedFiles(issue, changedFileSet)) {
      scoped.push(issue);
    } else {
      debt.push(issue);
    }
  }

  return {
    scoped,
    debt,
    scopedWarnings: scoped.filter(item => item.severity === 'warning')
  };
}

function evaluatePreCommit(targetDir, options = {}) {
  const change = analyzeChange(targetDir, { mode: 'working', changedFiles: options.changedFiles });
  const quality = analyzeQuality(targetDir, options);
  const qualitySplit = splitQualityIssues(quality.issues, change.changedFiles);
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
    summary: blockers.length ? 'Pre-commit gate would block the change.' : 'Pre-commit gate would pass with current lightweight checks.',
    status: blockers.length ? 'block' : 'pass',
    blockers,
    detail: {
      changeSummary: change.counts,
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
  const qualitySplit = splitQualityIssues(quality.issues, change.changedFiles);
  const blockers = [];

  if (security.findings.some(item => item.severity === 'critical' || item.severity === 'high')) {
    blockers.push('security scan reported high or critical findings');
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
    summary: blockers.length ? 'Pre-merge gate would block the change.' : 'Pre-merge gate would pass with current lightweight checks.',
    status: blockers.length ? 'block' : 'pass',
    blockers,
    detail: {
      changeSummary: change.counts,
      changedFiles: change.changedFiles.length,
      qualityIssuesInChangedFiles: qualitySplit.scoped.length,
      qualityWarningsInChangedFiles: qualitySplit.scopedWarnings.length,
      qualityDebtOutsideChangedFiles: qualitySplit.debt.length,
      qualityIssuesTotal: quality.issues.length,
      securityFindings: security.findings.length
    }
  };
}

module.exports = {
  generateDocs,
  analyzeModule,
  analyzeChange,
  analyzeChartSpec,
  analyzeS2Config,
  analyzeQuality,
  analyzeSecurity,
  evaluatePreCommit,
  evaluatePreMerge
};
