#!/usr/bin/env node
'use strict';

const { parseArgs, resolveTarget, emit } = require('../../lib/runtime');
const { analyzeChange } = require('../../lib/analyzers');

const args = parseArgs(process.argv.slice(2));
const target = resolveTarget(args.target);
const report = analyzeChange(target, { mode: args.mode, changedFiles: args.changedFiles });

emit(report, args);
