'use strict';

const fs = require('fs');
const path = require('path');
const { parseJsonFile, rel } = require('./skill-system-common');
const { validateRouteMap, validateRouteFixtures } = require('./skill-system-routing');

function validateRegistryEntries(targetDir, registryPath, registryData, skillRecords, findings) {
  const registrySkills = Array.isArray(registryData && registryData.skills) ? registryData.skills : [];
  const registryNames = new Set();

  for (const entry of registrySkills) {
    registryNames.add(entry.name);
    if (!entry.path || !fs.existsSync(path.join(targetDir, entry.path))) {
      findings.push({ severity: 'error', file: rel(targetDir, registryPath), message: `registry points to missing skill path for '${entry.name}'` });
    }
  }

  for (const record of skillRecords) {
    if (!registryNames.has(record.name)) {
      findings.push({ severity: 'error', file: record.file, message: `skill '${record.name}' is missing from registry.generated.json` });
    }
  }

  return {
    registrySkills,
    registryNames
  };
}

function validateModuleGroups(targetDir, registryPath, registryData, registryNames, findings) {
  const moduleGroups = Array.isArray(registryData && registryData['module-groups']) ? registryData['module-groups'] : [];
  const moduleNames = new Set();

  for (const group of moduleGroups) {
    if (!registryNames.has(group['host-skill'])) {
      findings.push({ severity: 'error', file: rel(targetDir, registryPath), message: `module group references unknown host skill '${group['host-skill']}'` });
      continue;
    }
    const modules = Array.isArray(group.modules) ? group.modules : [];
    for (const module of modules) {
      if (moduleNames.has(module.id)) {
        findings.push({ severity: 'error', file: rel(targetDir, registryPath), message: `duplicate capability module id '${module.id}'` });
        continue;
      }
      moduleNames.add(module.id);
      if (!module.path || !fs.existsSync(path.join(targetDir, module.path))) {
        findings.push({ severity: 'error', file: rel(targetDir, registryPath), message: `capability module '${module.id}' points to a missing file` });
      }
    }
  }

  return {
    moduleGroups,
    moduleNames
  };
}

function validateGeneratedMetadata(targetDir, skillRecords, findings) {
  const registryPath = path.join(targetDir, 'registry', 'registry.generated.json');
  const routeMapPath = path.join(targetDir, 'registry', 'route-map.generated.json');
  const routeFixturesPath = path.join(targetDir, 'registry', 'route-fixtures.generated.json');

  const registry = parseJsonFile(registryPath);
  const routeMap = parseJsonFile(routeMapPath);
  const routeFixtures = parseJsonFile(routeFixturesPath);

  if (registry.error) {
    findings.push({ severity: 'error', file: rel(targetDir, registryPath), message: `registry parse failed: ${registry.error}` });
  }
  if (routeMap.error) {
    findings.push({ severity: 'error', file: rel(targetDir, routeMapPath), message: `route map parse failed: ${routeMap.error}` });
  }
  if (routeFixtures.error) {
    findings.push({ severity: 'warning', file: rel(targetDir, routeFixturesPath), message: `route fixtures parse failed: ${routeFixtures.error}` });
  }

  const { registrySkills, registryNames } = validateRegistryEntries(targetDir, registryPath, registry.data, skillRecords, findings);
  const { moduleGroups, moduleNames } = validateModuleGroups(targetDir, registryPath, registry.data, registryNames, findings);
  const routes = validateRouteMap(targetDir, routeMapPath, routeMap.data, registryNames, skillRecords, moduleNames, findings, rel);
  const fixtures = validateRouteFixtures(targetDir, routeFixturesPath, routeFixtures.data, routeMap.data, registryNames, findings, rel);

  return {
    registrySkills,
    moduleGroups,
    moduleNames,
    routes,
    fixtures
  };
}

module.exports = {
  validateGeneratedMetadata
};
