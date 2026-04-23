'use strict';

const fs = require('fs');
const path = require('path');
const { collectSkills } = require('./skill-registry');
const DISTRIBUTION_HOSTS = ['claude', 'codex', 'gemini'];

function normalizeRelPath(relPath) {
  const normalized = String(relPath || '').split(path.sep).join('/');
  return normalized === '' ? '.' : normalized;
}

function normalizePackageEntry(entry) {
  return String(entry || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/\/+$/, '');
}

function packagePolicyIncludesPath(files, relPath) {
  const target = normalizePackageEntry(relPath);
  return (Array.isArray(files) ? files : [])
    .map(normalizePackageEntry)
    .some((entry) => entry && (entry === target || target.startsWith(`${entry}/`)));
}

function readPackagePolicy(packageJsonPath) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return {
    packageJsonPath,
    files: Array.isArray(pkg.files) ? pkg.files.slice() : [],
  };
}

function readDistributionPolicy(packManifestPath) {
  const manifest = JSON.parse(fs.readFileSync(packManifestPath, 'utf8'));
  const hostSkillSources = {};

  for (const host of DISTRIBUTION_HOSTS) {
    const hostConfig = manifest && manifest.hosts ? manifest.hosts[host] : null;
    const files = hostConfig && Array.isArray(hostConfig.files) ? hostConfig.files : [];
    const skillEntry = files.find((entry) => normalizePackageEntry(entry.dest) === 'skills');
    hostSkillSources[host] = skillEntry ? normalizePackageEntry(skillEntry.src) : null;
  }

  return {
    packManifestPath,
    hostSkillSources,
  };
}

function collectSkillRecords(skillsDir) {
  return collectSkills(skillsDir)
    .map((skill) => ({
      name: skill.name,
      relPath: normalizeRelPath(skill.relPath),
    }))
    .sort((left, right) => left.relPath.localeCompare(right.relPath) || left.name.localeCompare(right.name));
}

function summarizeStatus(findings) {
  if (findings.some((item) => item.severity === 'error')) return 'fail';
  if (findings.some((item) => item.severity === 'warning')) return 'warn';
  return 'pass';
}

function analyzeSkillSourcePolicy(options = {}) {
  const projectRoot = path.resolve(options.projectRoot || path.join(__dirname, '..', '..'));
  const packageJsonPath = path.resolve(options.packageJsonPath || path.join(projectRoot, 'package.json'));
  const authoritativeSystemDir = path.resolve(options.authoritativeSystemDir || path.join(projectRoot, 'personal-skill-system'));
  const authoritativeSkillsDir = path.resolve(options.authoritativeSkillsDir || path.join(authoritativeSystemDir, 'skills'));
  const rootMirrorDir = path.resolve(options.rootMirrorDir || path.join(projectRoot, 'skills'));
  const packManifestPath = path.resolve(options.packManifestPath || path.join(projectRoot, 'packs', 'abyss', 'manifest.json'));

  const packagePolicy = readPackagePolicy(packageJsonPath);
  const distributionPolicy = readDistributionPolicy(packManifestPath);
  const authoritativeSkills = collectSkillRecords(authoritativeSkillsDir);
  const rootMirrorSkills = collectSkillRecords(rootMirrorDir);

  const authoritativeSkillPathSet = new Set(authoritativeSkills.map((item) => item.relPath));
  const rootMirrorPathSet = new Set(rootMirrorSkills.map((item) => item.relPath));
  const rootMirrorByName = new Map(rootMirrorSkills.map((item) => [item.name, item]));

  const missingSkillPaths = authoritativeSkills
    .filter((item) => !rootMirrorPathSet.has(item.relPath))
    .map((item) => item.relPath);
  const extraSkillPaths = rootMirrorSkills
    .filter((item) => !authoritativeSkillPathSet.has(item.relPath))
    .map((item) => item.relPath);
  const canonicalPathMismatches = authoritativeSkills
    .filter((item) => rootMirrorByName.has(item.name) && rootMirrorByName.get(item.name).relPath !== item.relPath)
    .map((item) => ({
      name: item.name,
      authoritativePath: item.relPath,
      rootMirrorPath: rootMirrorByName.get(item.name).relPath,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const authoritativeSkillsRel = normalizePackageEntry(path.relative(projectRoot, authoritativeSkillsDir));
  const authoritativeSystemRel = normalizePackageEntry(path.relative(projectRoot, authoritativeSystemDir));
  const rootMirrorRel = normalizePackageEntry(path.relative(projectRoot, rootMirrorDir));
  const includesAuthoritativeSkillsDir = packagePolicyIncludesPath(packagePolicy.files, authoritativeSkillsRel);
  const includesAuthoritativeSystemDir = packagePolicyIncludesPath(packagePolicy.files, authoritativeSystemRel);
  const includesRootMirrorDir = packagePolicyIncludesPath(packagePolicy.files, rootMirrorRel);
  const distributionHostsMissingSkillsEntry = DISTRIBUTION_HOSTS.filter(
    (host) => !distributionPolicy.hostSkillSources[host]
  );
  const distributionHostsUsingAuthoritativeSource = DISTRIBUTION_HOSTS.filter(
    (host) => distributionPolicy.hostSkillSources[host] === authoritativeSkillsRel
  );
  const distributionHostsUsingLegacyMirror = DISTRIBUTION_HOSTS.filter(
    (host) => distributionPolicy.hostSkillSources[host] === rootMirrorRel
  );
  const distributionHostsUsingOtherSource = DISTRIBUTION_HOSTS.filter((host) => {
    const source = distributionPolicy.hostSkillSources[host];
    return source && source !== authoritativeSkillsRel;
  });

  const findings = [];
  if (!includesAuthoritativeSystemDir) {
    findings.push({
      severity: 'error',
      file: path.relative(projectRoot, packageJsonPath).split(path.sep).join('/'),
      message: `package.json.files does not include the authoritative bundle '${authoritativeSystemRel}'`,
    });
  }
  if (!includesAuthoritativeSkillsDir) {
    findings.push({
      severity: 'error',
      file: path.relative(projectRoot, packageJsonPath).split(path.sep).join('/'),
      message: `package.json.files does not include the authoritative source '${authoritativeSkillsRel}'`,
    });
  }
  if (includesRootMirrorDir) {
    findings.push({
      severity: 'error',
      file: path.relative(projectRoot, packageJsonPath).split(path.sep).join('/'),
      message: `package.json.files still ships the legacy root mirror '${rootMirrorRel}/' after authoritative-source cutover`,
    });
  }
  if (distributionHostsMissingSkillsEntry.length > 0) {
    findings.push({
      severity: 'error',
      file: path.relative(projectRoot, packManifestPath).split(path.sep).join('/'),
      message: `abyss manifest is missing a skills distribution entry for host(s): ${distributionHostsMissingSkillsEntry.join(', ')}`,
    });
  }
  if (distributionHostsUsingOtherSource.length > 0) {
    findings.push({
      severity: 'error',
      file: path.relative(projectRoot, packManifestPath).split(path.sep).join('/'),
      message: `abyss manifest routes host(s) to non-authoritative skill source(s): ${distributionHostsUsingOtherSource.map((host) => `${host}=${distributionPolicy.hostSkillSources[host]}`).join(', ')}`,
    });
  }
  if ((includesRootMirrorDir || distributionHostsUsingLegacyMirror.length > 0) && missingSkillPaths.length > 0) {
    findings.push({
      severity: 'error',
      file: rootMirrorRel,
      message: `root mirror is missing ${missingSkillPaths.length} authoritative skill paths`,
    });
  }
  if ((includesRootMirrorDir || distributionHostsUsingLegacyMirror.length > 0) && extraSkillPaths.length > 0) {
    findings.push({
      severity: 'error',
      file: rootMirrorRel,
      message: `root mirror exposes ${extraSkillPaths.length} non-authoritative skill paths`,
    });
  }
  if ((includesRootMirrorDir || distributionHostsUsingLegacyMirror.length > 0) && canonicalPathMismatches.length > 0) {
    findings.push({
      severity: 'error',
      file: rootMirrorRel,
      message: `${canonicalPathMismatches.length} skill names resolve to non-canonical root mirror paths`,
    });
  }

  return {
    tool: 'verify-skill-distribution',
    status: summarizeStatus(findings),
    summary: distributionHostsUsingAuthoritativeSource.length === DISTRIBUTION_HOSTS.length
      && !includesRootMirrorDir
      ? `Distribution uses the authoritative source directly for ${DISTRIBUTION_HOSTS.length} hosts.`
      : `Compared ${authoritativeSkills.length} authoritative skills against ${rootMirrorSkills.length} root mirror skills.`,
    authoritativeSource: {
      systemDir: authoritativeSystemDir,
      skillsDir: authoritativeSkillsDir,
      relPath: authoritativeSkillsRel,
      count: authoritativeSkills.length,
    },
    rootMirror: {
      dir: rootMirrorDir,
      relPath: rootMirrorRel,
      count: rootMirrorSkills.length,
    },
    packagePolicy: {
      packageJsonPath,
      files: packagePolicy.files,
      includesAuthoritativeSkillsDir,
      includesAuthoritativeSystemDir,
      includesRootMirrorDir,
    },
    distributionPolicy: {
      packManifestPath,
      hostSkillSources: distributionPolicy.hostSkillSources,
      usesAuthoritativeSourceDirectly: distributionHostsUsingAuthoritativeSource.length === DISTRIBUTION_HOSTS.length
        && !includesRootMirrorDir,
      distributionHostsUsingAuthoritativeSource,
      distributionHostsUsingLegacyMirror,
      distributionHostsMissingSkillsEntry,
    },
    gaps: {
      missingSkillPaths,
      extraSkillPaths,
      canonicalPathMismatches,
    },
    metrics: {
      authoritativeSkillCount: authoritativeSkills.length,
      rootMirrorSkillCount: rootMirrorSkills.length,
      missingSkillPathCount: missingSkillPaths.length,
      extraSkillPathCount: extraSkillPaths.length,
      canonicalPathMismatchCount: canonicalPathMismatches.length,
    },
    findings,
    nextSteps: [
      'keep pack manifests pointed at personal-skill-system/skills',
      'do not reintroduce root skills/ into package files',
      'keep the legacy root mirror retired (do not recreate root skills/)',
    ],
  };
}

module.exports = {
  analyzeSkillSourcePolicy,
  collectSkillRecords,
  normalizeRelPath,
  normalizePackageEntry,
  packagePolicyIncludesPath,
  readDistributionPolicy,
  readPackagePolicy,
};
