#!/usr/bin/env node
'use strict';

const { parseArgs, resolveTarget, emit } = require('../../lib/runtime');
const { analyzeModule } = require('../../lib/analyzers');

const args = parseArgs(process.argv.slice(2));
const target = resolveTarget(args.target);
const report = analyzeModule(target, args);

emit(report, args);
