#!/usr/bin/env node
'use strict';

const { generateDocs, analyzeModule } = require('./doc-module-analysis');
const { analyzeChange } = require('./change-analysis');
const { analyzeChartSpec } = require('./chart-spec-analysis');
const { analyzeQuality } = require('./quality-analysis');
const { analyzeSecurity } = require('./security-analysis');
const { analyzeS2Config } = require('./s2-config-analysis');
const { evaluatePreCommit, evaluatePreMerge } = require('./gate-analysis');

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
