#!/usr/bin/env node
'use strict';

const { parseArgs, resolveTarget, emit } = require('../../../tools/lib/runtime');
const { evaluatePreMerge } = require('../../../tools/lib/analyzers');

const args = parseArgs(process.argv.slice(2));
const target = resolveTarget(args.target);
const report = evaluatePreMerge(target, args);

emit(report, args);
