#!/usr/bin/env node
'use strict';

const { parseArgs, resolveTarget, emit } = require('../../../tools/lib/runtime');
const { evaluatePreCommit } = require('../../../tools/lib/analyzers');

const args = parseArgs(process.argv.slice(2));
const target = resolveTarget(args.target);
const report = evaluatePreCommit(target, args);

emit(report, args);
