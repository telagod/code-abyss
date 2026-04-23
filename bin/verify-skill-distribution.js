#!/usr/bin/env node
'use strict';

const path = require('path');
const { analyzeSkillSourcePolicy } = require('./lib/skill-source-policy');

function parseArgs(argv) {
  const args = {
    json: false,
    projectRoot: path.join(__dirname, '..'),
    packageJsonPath: null,
    authoritativeSystemDir: null,
    authoritativeSkillsDir: null,
    rootMirrorDir: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === '--json') {
      args.json = true;
      continue;
    }
    if (token === '--project-root' && next) {
      args.projectRoot = next;
      index += 1;
      continue;
    }
    if (token === '--package-json' && next) {
      args.packageJsonPath = next;
      index += 1;
      continue;
    }
    if (token === '--authoritative-system-dir' && next) {
      args.authoritativeSystemDir = next;
      index += 1;
      continue;
    }
    if (token === '--authoritative-skills-dir' && next) {
      args.authoritativeSkillsDir = next;
      index += 1;
      continue;
    }
    if (token === '--root-mirror-dir' && next) {
      args.rootMirrorDir = next;
      index += 1;
    }
  }

  return args;
}

function renderSkillPath(rootRelPath, skillRelPath) {
  if (skillRelPath === '.') return `${rootRelPath}/SKILL.md`;
  return `${rootRelPath}/${skillRelPath}/SKILL.md`;
}

function printHumanReport(report) {
  console.log(`skill source policy: ${report.status}`);
  console.log(report.summary);
  console.log(`authoritative source: ${report.authoritativeSource.relPath} (${report.metrics.authoritativeSkillCount})`);
  console.log(`root mirror: ${report.rootMirror.relPath} (${report.metrics.rootMirrorSkillCount})`);
  console.log(`package includes authoritative source: ${report.packagePolicy.includesAuthoritativeSkillsDir ? 'yes' : 'no'}`);
  console.log(`package ships root mirror: ${report.packagePolicy.includesRootMirrorDir ? 'yes' : 'no'}`);
  Object.entries(report.distributionPolicy.hostSkillSources).forEach(([host, source]) => {
    console.log(`host ${host} skills src: ${source || 'missing'}`);
  });
  console.log(`missing mirror paths: ${report.metrics.missingSkillPathCount}`);
  console.log(`extra mirror paths: ${report.metrics.extraSkillPathCount}`);
  console.log(`canonical path mismatches: ${report.metrics.canonicalPathMismatchCount}`);

  if (report.gaps.missingSkillPaths.length > 0) {
    console.log('missing from root mirror:');
    report.gaps.missingSkillPaths.forEach((item) => {
      console.log(`- ${renderSkillPath(report.authoritativeSource.relPath, item)}`);
    });
  }

  if (report.gaps.extraSkillPaths.length > 0) {
    console.log('extra in root mirror:');
    report.gaps.extraSkillPaths.forEach((item) => {
      console.log(`- ${renderSkillPath(report.rootMirror.relPath, item)}`);
    });
  }

  if (report.gaps.canonicalPathMismatches.length > 0) {
    console.log('canonical path mismatches:');
    report.gaps.canonicalPathMismatches.forEach((item) => {
      console.log(`- ${item.name}: ${renderSkillPath(report.authoritativeSource.relPath, item.authoritativePath)} != ${renderSkillPath(report.rootMirror.relPath, item.rootMirrorPath)}`);
    });
  }

  if (report.findings.length > 0) {
    console.log('findings:');
    report.findings.forEach((finding) => {
      console.log(`- [${finding.severity}] ${finding.message}`);
    });
  }
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = analyzeSkillSourcePolicy(args);

  if (args.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    printHumanReport(report);
  }

  if (report.status === 'fail') {
    process.exitCode = 1;
  }

  return report;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  main,
  parseArgs,
  printHumanReport,
};
