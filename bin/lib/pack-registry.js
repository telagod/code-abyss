'use strict';

const fs = require('fs');
const path = require('path');
const { listVendorProviderNames } = require('./vendor-providers');

const PROJECT_PACKS_LOCK_REL = path.join('.code-abyss', 'packs.lock.json');
const OPTIONAL_POLICIES = new Set(['auto', 'prompt', 'off']);
const PACK_SOURCE_MODES = new Set(['pinned', 'local', 'disabled']);
const HOST_NAMES = ['claude', 'codex', 'gemini'];

function validatePackManifest(manifest, manifestPath, projectRoot = null) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object') {
    errors.push('manifest 必须是对象');
  } else {
    if (typeof manifest.name !== 'string' || manifest.name.trim() === '') {
      errors.push('name 必填');
    }
    if (typeof manifest.description !== 'string' || manifest.description.trim() === '') {
      errors.push('description 必填');
    }
    if (!manifest.hosts || typeof manifest.hosts !== 'object') {
      errors.push('hosts 必填');
    } else {
      Object.entries(manifest.hosts).forEach(([host, hostConfig]) => {
        if (!HOST_NAMES.includes(host)) errors.push(`未知 host: ${host}`);
        if (!hostConfig || typeof hostConfig !== 'object') {
          errors.push(`host ${host} 配置无效`);
          return;
        }
        if (hostConfig.files && !Array.isArray(hostConfig.files)) {
          errors.push(`host ${host}.files 必须是数组`);
        }
        (hostConfig.files || []).forEach((file, index) => {
          if (!file.src || !file.dest || !file.root) {
            errors.push(`host ${host}.files[${index}] 缺少 src/dest/root`);
          }
        });
        if (hostConfig.uninstall) {
          if (!hostConfig.uninstall.runtimeRoot) {
            errors.push(`host ${host}.uninstall 缺少 runtimeRoot`);
          } else if (!hostConfig.uninstall.runtimeRoot.root || !hostConfig.uninstall.runtimeRoot.path) {
            errors.push(`host ${host}.uninstall.runtimeRoot 缺少 root/path`);
          }
        }
      });
    }
    if (manifest.reporting && typeof manifest.reporting !== 'object') {
      errors.push('reporting 必须是对象');
    }
    if (manifest.reporting && manifest.reporting.label && typeof manifest.reporting.label !== 'string') {
      errors.push('reporting.label 必须是字符串');
    }
    if (manifest.reporting && manifest.reporting.artifactPrefix && typeof manifest.reporting.artifactPrefix !== 'string') {
      errors.push('reporting.artifactPrefix 必须是字符串');
    }
    if (manifest.upstream) {
      const provider = manifest.upstream.provider || 'git';
      const providerNames = new Set(listVendorProviderNames(projectRoot));
      if (!providerNames.has(provider)) {
        errors.push(`upstream.provider 非法: ${provider}`);
      }
      if (provider === 'git' && (!manifest.upstream.repo || !manifest.upstream.commit)) {
        errors.push('upstream.provider=git 时必须提供 repo 和 commit');
      }
      if ((provider === 'local-dir' || provider === 'archive') && !manifest.upstream.path) {
        errors.push(`upstream.provider=${provider} 时必须提供 path`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`pack manifest 无效: ${manifestPath}\n- ${errors.join('\n- ')}`);
  }
}

function getPacksRoot(projectRoot) {
  return path.join(projectRoot, 'packs');
}

function listPackNames(projectRoot) {
  const packsRoot = getPacksRoot(projectRoot);
  if (!fs.existsSync(packsRoot)) return [];

  return fs.readdirSync(packsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(packsRoot, name, 'manifest.json')))
    .sort();
}

function readPackManifest(projectRoot, packName) {
  const manifestPath = path.join(getPacksRoot(projectRoot), packName, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`未找到 pack manifest: ${manifestPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`pack manifest 无效: ${manifestPath}`);
  }
  validatePackManifest(parsed, manifestPath, projectRoot);
  if (parsed.name !== packName) {
    throw new Error(`pack manifest 名称不匹配: ${manifestPath}`);
  }
  return parsed;
}

function listPacks(projectRoot) {
  return listPackNames(projectRoot).map((name) => readPackManifest(projectRoot, name));
}

function getPack(projectRoot, packName) {
  return readPackManifest(projectRoot, packName);
}

function getPackHostConfig(projectRoot, packName, hostName) {
  const manifest = getPack(projectRoot, packName);
  return (manifest.hosts && manifest.hosts[hostName]) || null;
}

function getPackReporting(projectRoot, packName) {
  const manifest = getPack(projectRoot, packName);
  return {
    label: (manifest.reporting && manifest.reporting.label) || packName,
    artifactPrefix: (manifest.reporting && manifest.reporting.artifactPrefix) || packName,
  };
}

function getPackHostFiles(projectRoot, packName, hostName) {
  const host = getPackHostConfig(projectRoot, packName, hostName);
  if (!host || !Array.isArray(host.files)) return [];

  return host.files.map((entry) => ({
    src: entry.src,
    dest: entry.dest,
    root: entry.root,
  }));
}

function findProjectPacksLock(startDir = process.cwd()) {
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, PROJECT_PACKS_LOCK_REL);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function readProjectPackLock(startDir = process.cwd()) {
  const lockPath = findProjectPacksLock(startDir);
  if (!lockPath) return null;

  const parsed = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`project packs lock 无效: ${lockPath}`);
  }
  if (parsed.version !== 1) {
    throw new Error(`project packs lock version 不支持: ${lockPath}`);
  }
  return {
    path: lockPath,
    root: path.dirname(path.dirname(lockPath)),
    lock: parsed,
  };
}

function resolveProjectPacks(startDir = process.cwd(), hostName) {
  const payload = readProjectPackLock(startDir);
  if (!payload) {
    return {
      root: null,
      path: null,
      required: [],
      optional: [],
    };
  }

  const normalized = normalizeProjectPackLock(payload.lock);
  const hostConfig = normalized.hosts && normalized.hosts[hostName];
  const required = Array.isArray(hostConfig && hostConfig.required) ? hostConfig.required.slice() : [];
  const optional = Array.isArray(hostConfig && hostConfig.optional) ? hostConfig.optional.slice() : [];
  const optionalPolicy = (hostConfig && hostConfig.optional_policy) || 'auto';

  return {
    root: payload.root,
    path: payload.path,
    required,
    optional,
    optionalPolicy,
    sources: { ...(hostConfig && hostConfig.sources ? hostConfig.sources : {}) },
  };
}

function uniqueSorted(values) {
  return [...new Set((values || []).filter(Boolean))].sort();
}

function normalizeHostPackConfig(hostConfig = {}) {
  const sources = {};
  Object.entries(hostConfig.sources || {}).forEach(([pack, source]) => {
    sources[pack] = PACK_SOURCE_MODES.has(source) ? source : 'pinned';
  });
  return {
    required: uniqueSorted(hostConfig.required),
    optional: uniqueSorted(hostConfig.optional),
    optional_policy: OPTIONAL_POLICIES.has(hostConfig.optional_policy) ? hostConfig.optional_policy : 'auto',
    sources,
  };
}

function normalizeProjectPackLock(lock = {}) {
  const hosts = {};
  HOST_NAMES.forEach((host) => {
    hosts[host] = normalizeHostPackConfig(lock.hosts && lock.hosts[host]);
  });

  return {
    version: 1,
    hosts,
  };
}

function buildDefaultProjectPackLock(projectRoot, hostNames = HOST_NAMES) {
  const packs = listPacks(projectRoot);
  const lock = normalizeProjectPackLock({ version: 1, hosts: {} });

  hostNames.forEach((host) => {
    const required = [];
    const optional = [];
    const sources = {};

    packs.forEach((pack) => {
      const defaultMode = pack.projectDefaults && pack.projectDefaults[host];
      if (defaultMode === 'required') {
        required.push(pack.name);
        sources[pack.name] = 'pinned';
      }
      if (defaultMode === 'optional') {
        optional.push(pack.name);
        sources[pack.name] = 'pinned';
      }
    });

    lock.hosts[host] = {
      required: uniqueSorted(required),
      optional: uniqueSorted(optional),
      optional_policy: 'auto',
      sources,
    };
  });

  return lock;
}

function validateProjectPackLock(lock, projectRoot) {
  const normalized = normalizeProjectPackLock(lock);
  const available = new Set(listPackNames(projectRoot));
  const errors = [];

  HOST_NAMES.forEach((host) => {
    const rawHost = (lock.hosts && lock.hosts[host]) || {};
    const hostConfig = normalized.hosts[host];
    const listed = new Set([...hostConfig.required, ...hostConfig.optional]);
    hostConfig.required.forEach((pack) => {
      if (!available.has(pack)) errors.push(`[${host}] 未知 required pack: ${pack}`);
      if (pack === 'abyss') errors.push(`[${host}] core pack 'abyss' 不应写入 packs.lock`);
      if (hostConfig.sources[pack] === 'disabled') errors.push(`[${host}] required pack 不能设置 source=disabled: ${pack}`);
    });
    hostConfig.optional.forEach((pack) => {
      if (!available.has(pack)) errors.push(`[${host}] 未知 optional pack: ${pack}`);
      if (pack === 'abyss') errors.push(`[${host}] core pack 'abyss' 不应写入 packs.lock`);
      if (hostConfig.required.includes(pack)) errors.push(`[${host}] pack 同时出现在 required 和 optional: ${pack}`);
    });
    if (rawHost.optional_policy && !OPTIONAL_POLICIES.has(rawHost.optional_policy)) {
      errors.push(`[${host}] optional_policy 非法: ${rawHost.optional_policy}`);
    }
    Object.entries(rawHost.sources || {}).forEach(([pack, source]) => {
      if (!PACK_SOURCE_MODES.has(source)) {
        errors.push(`[${host}] source 非法: ${pack}=${source}`);
      }
      if (!listed.has(pack)) {
        errors.push(`[${host}] source 指向未声明 pack: ${pack}`);
      }
    });
  });

  return errors;
}

async function selectProjectPacksForInstall(projectPacks, { autoYes = false, confirm = null } = {}) {
  const sources = { ...(projectPacks.sources || {}) };
  const required = uniqueSorted(projectPacks.required).filter((pack) => sources[pack] !== 'disabled');
  const optional = uniqueSorted(projectPacks.optional).filter((pack) => sources[pack] !== 'disabled');
  const policy = projectPacks.optionalPolicy || 'auto';

  if (policy === 'off' || optional.length === 0) {
    return { selected: required, optionalSelected: [], optionalPolicy: policy, sources };
  }

  if (policy === 'auto') {
    return {
      selected: uniqueSorted([...required, ...optional]),
      optionalSelected: optional,
      optionalPolicy: policy,
      sources,
    };
  }

  if (autoYes || typeof confirm !== 'function') {
    return {
      selected: uniqueSorted([...required, ...optional]),
      optionalSelected: optional,
      optionalPolicy: policy,
      sources,
    };
  }

  const accepted = await confirm(optional);
  return {
    selected: accepted ? uniqueSorted([...required, ...optional]) : required,
    optionalSelected: accepted ? optional : [],
    optionalPolicy: policy,
    sources,
  };
}

function diffProjectPackLocks(currentLock, defaultLock) {
  const current = normalizeProjectPackLock(currentLock);
  const defaults = normalizeProjectPackLock(defaultLock);
  const diffs = [];

  HOST_NAMES.forEach((host) => {
    const now = current.hosts[host];
    const base = defaults.hosts[host];

    const addedRequired = now.required.filter((pack) => !base.required.includes(pack));
    const removedRequired = base.required.filter((pack) => !now.required.includes(pack));
    const addedOptional = now.optional.filter((pack) => !base.optional.includes(pack));
    const removedOptional = base.optional.filter((pack) => !now.optional.includes(pack));
    const sourceChanges = {};

    uniqueSorted([...Object.keys(now.sources), ...Object.keys(base.sources)]).forEach((pack) => {
      const from = base.sources[pack] || null;
      const to = now.sources[pack] || null;
      if (from !== to) sourceChanges[pack] = { from, to };
    });

    if (
      addedRequired.length > 0
      || removedRequired.length > 0
      || addedOptional.length > 0
      || removedOptional.length > 0
      || now.optional_policy !== base.optional_policy
      || Object.keys(sourceChanges).length > 0
    ) {
      diffs.push({
        host,
        addedRequired,
        removedRequired,
        addedOptional,
        removedOptional,
        optionalPolicy: { from: base.optional_policy, to: now.optional_policy },
        sourceChanges,
      });
    }
  });

  return diffs;
}

module.exports = {
  getPacksRoot,
  listPackNames,
  listPacks,
  getPack,
  getPackHostConfig,
  getPackReporting,
  getPackHostFiles,
  PROJECT_PACKS_LOCK_REL,
  HOST_NAMES,
  OPTIONAL_POLICIES,
  PACK_SOURCE_MODES,
  validatePackManifest,
  normalizeHostPackConfig,
  normalizeProjectPackLock,
  buildDefaultProjectPackLock,
  validateProjectPackLock,
  findProjectPacksLock,
  readProjectPackLock,
  resolveProjectPacks,
  selectProjectPacksForInstall,
  diffProjectPackLocks,
};
