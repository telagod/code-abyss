#!/usr/bin/env node
'use strict';

const { generateDocs, analyzeModule } = require('./doc-module-analysis');
const { analyzeChange } = require('./change-analysis');
const { analyzeQuality } = require('./quality-analysis');
const { analyzeSecurity } = require('./security-analysis');

function evaluatePreCommit(targetDir, options = {}) {
  const change = analyzeChange(targetDir, 'working');
  const quality = analyzeQuality(targetDir, options);
  const blockers = [];

  if (change.findings.some(item => item.severity === 'warning' && /no test files changed/.test(item.message))) {
    blockers.push('code changed without any accompanying test changes');
  }
  if (quality.issues.some(item => item.severity === 'warning')) {
    blockers.push('quality scan reported warning-level issues');
  }

  return {
    guard: 'pre-commit-gate',
    target: targetDir,
    summary: blockers.length ? 'Pre-commit gate would block the change.' : 'Pre-commit gate would pass with current lightweight checks.',
    status: blockers.length ? 'block' : 'pass',
    blockers,
    detail: {
      changeSummary: change.counts,
      qualityIssues: quality.issues.length
    }
  };
}

function evaluatePreMerge(targetDir, options = {}) {
  const change = analyzeChange(targetDir, 'working');
  const quality = analyzeQuality(targetDir, options);
  const security = analyzeSecurity(targetDir, options);
  const blockers = [];

  if (security.findings.some(item => item.severity === 'critical' || item.severity === 'high')) {
    blockers.push('security scan reported high or critical findings');
  }
  if (quality.issues.some(item => item.severity === 'warning')) {
    blockers.push('quality scan reported warning-level issues');
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
      qualityIssues: quality.issues.length,
      securityFindings: security.findings.length
    }
  };
}

module.exports = {
  generateDocs,
  analyzeModule,
  analyzeChange,
  analyzeQuality,
  analyzeSecurity,
  evaluatePreCommit,
  evaluatePreMerge
};
