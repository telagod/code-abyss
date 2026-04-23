'use strict';

const fs = require('fs');
const path = require('path');
const { parseJsonFile } = require('./skill-system-common');

const EXPECTED_PACK_MODES = new Set(['copy', 'overlay']);
const RESERVED_EMPTY_PACKS = new Set(['project-overlay', 'work-private']);

function analyzePackManifests(targetDir, findings, rel) {
  const packsRoot = path.join(targetDir, 'packs');
  const hostCapabilitiesPath = path.join(targetDir, 'registry', 'host-capabilities.json');
  const hostCapabilities = parseJsonFile(hostCapabilitiesPath);
  const supportedHosts = new Set(Object.keys(hostCapabilities.data || {}));

  let packCount = 0;
  if (!fs.existsSync(packsRoot)) return packCount;

  const packDirs = fs.readdirSync(packsRoot, { withFileTypes: true }).filter(entry => entry.isDirectory());
  for (const dir of packDirs) {
    const manifestPath = path.join(packsRoot, dir.name, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;
    packCount += 1;

    const parsed = parseJsonFile(manifestPath);
    if (parsed.error) {
      findings.push({ severity: 'error', file: rel(targetDir, manifestPath), message: `pack manifest parse failed: ${parsed.error}` });
      continue;
    }

    const manifest = parsed.data || {};
    if (manifest.name !== dir.name) {
      findings.push({ severity: 'warning', file: rel(targetDir, manifestPath), message: `pack manifest name '${manifest.name}' does not match directory '${dir.name}'` });
    }
    if (!EXPECTED_PACK_MODES.has(manifest.mode)) {
      findings.push({ severity: 'error', file: rel(targetDir, manifestPath), message: `pack mode '${manifest.mode}' is invalid` });
    }

    const includes = Array.isArray(manifest.includes) ? manifest.includes : [];
    if (includes.length === 0 && !RESERVED_EMPTY_PACKS.has(dir.name)) {
      findings.push({ severity: 'info', file: rel(targetDir, manifestPath), message: `pack '${dir.name}' has no includes yet` });
    }
    for (const includePath of includes) {
      if (!fs.existsSync(path.join(targetDir, includePath))) {
        findings.push({ severity: 'error', file: rel(targetDir, manifestPath), message: `pack include '${includePath}' does not exist` });
      }
    }

    const targets = Array.isArray(manifest.targets) ? manifest.targets : [];
    for (const target of targets) {
      if (supportedHosts.size > 0 && !supportedHosts.has(target)) {
        findings.push({ severity: 'error', file: rel(targetDir, manifestPath), message: `pack target '${target}' is not declared in host-capabilities.json` });
      }
    }

    if (dir.name === 'personal-core') {
      const required = ['skills/routers', 'skills/domains', 'skills/workflows', 'skills/tools', 'skills/guards'];
      for (const requiredInclude of required) {
        if (!includes.includes(requiredInclude)) {
          findings.push({ severity: 'warning', file: rel(targetDir, manifestPath), message: `personal-core is missing expected include '${requiredInclude}'` });
        }
      }
    }
  }

  return packCount;
}

module.exports = {
  analyzePackManifests
};
