'use strict';

const fs = require('fs');
const path = require('path');
const { EXPECTED_TOP_LEVEL_DIRS, rel } = require('./skill-system-common');
const { analyzePackManifests } = require('./skill-system-packs');
const { collectSkillRecords } = require('./skill-system-skills');
const { validateGeneratedMetadata } = require('./skill-system-registry');

function summarizeStatus(findings) {
  if (findings.some(item => item.severity === 'error')) return 'fail';
  if (findings.some(item => item.severity === 'warning')) return 'warn';
  return 'pass';
}

function analyzeTopLevelDirs(targetDir, findings) {
  let count = 0;
  for (const dirName of EXPECTED_TOP_LEVEL_DIRS) {
    const full = path.join(targetDir, dirName);
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
      findings.push({ severity: 'error', file: dirName, message: `missing top-level directory '${dirName}'` });
    } else {
      count += 1;
    }
  }
  return count;
}

function analyzeSkillSystem(targetDir) {
  const findings = [];
  const summary = {
    topLevelDirs: analyzeTopLevelDirs(targetDir, findings),
    skillFiles: 0,
    userInvocableSkills: 0,
    registrySkills: 0,
    moduleGroups: 0,
    capabilityModules: 0,
    routeEntries: 0,
    packCount: 0,
    routeFixtures: 0
  };

  const { skillFiles, skillRecords } = collectSkillRecords(targetDir, findings);
  summary.skillFiles = skillFiles.length;
  summary.userInvocableSkills = skillRecords.filter(item => item.userInvocable).length;

  const generated = validateGeneratedMetadata(targetDir, skillRecords, findings);
  summary.registrySkills = generated.registrySkills.length;
  summary.moduleGroups = generated.moduleGroups.length;
  summary.capabilityModules = generated.moduleNames.size;
  summary.routeEntries = generated.routes.length;
  summary.routeFixtures = generated.fixtures.length;
  summary.packCount = analyzePackManifests(targetDir, findings, rel);

  return {
    tool: 'verify-skill-system',
    target: targetDir,
    status: summarizeStatus(findings),
    summary: `Audited ${summary.skillFiles} skill files, ${summary.registrySkills} registry entries, ${summary.capabilityModules} capability modules, and ${summary.routeEntries} route entries.`,
    findings,
    metrics: summary,
    nextSteps: [
      'fix error-level structural breakage first',
      'treat warning-level drift as governance debt',
      'rerun after any registry or route-map change'
    ]
  };
}

module.exports = {
  analyzeSkillSystem
};
