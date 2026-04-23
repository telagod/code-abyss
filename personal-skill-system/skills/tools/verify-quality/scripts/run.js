#!/usr/bin/env node
'use strict';

const { parseArgs, resolveTarget, emit } = require('../../lib/runtime');
const { analyzeQuality } = require('../../lib/analyzers');

const args = parseArgs(process.argv.slice(2));
const target = resolveTarget(args.target);
const report = analyzeQuality(target, args);

emit(report, args);
