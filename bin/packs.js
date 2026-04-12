#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  PROJECT_PACKS_LOCK_REL,
  HOST_NAMES,
  OPTIONAL_POLICIES,
  PACK_SOURCE_MODES,
  listPackNames,
  getPack,
  getPackHostConfig,
  getPackReporting,
  buildDefaultProjectPackLock,
  normalizeProjectPackLock,
  readProjectPackLock,
  validateProjectPackLock,
  diffProjectPackLocks,
} = require('./lib/pack-registry');
const {
  syncPackVendor,
  removePackVendor,
  getPackVendorStatus,
} = require('./lib/pack-vendor');
const {
  renderReadmeSnippet,
  renderContributingSnippet,
  writeBootstrapSnippets,
  applyBootstrapDocs,
} = require('./lib/pack-bootstrap');
const { writeReportArtifact, listReportArtifacts, readLatestReportArtifact, summarizeReportArtifacts } = require('./lib/pack-reports');

function usage() {
  console.log(`用法:
  node bin/packs.js init [--force] [--host claude|codex|all] [--optional-policy auto|prompt|off]
                        [--add-required <pack[,pack...]>] [--add-optional <pack[,pack...]>] [--remove <pack[,pack...]>]
                        [--set-source <pack=mode[,pack=mode...]>]
  node bin/packs.js update [同上]
  node bin/packs.js bootstrap [同上] [--apply-docs]
  node bin/packs.js check
  node bin/packs.js diff
  node bin/packs.js vendor-pull <pack[,pack...]|all>
  node bin/packs.js vendor-sync [<pack[,pack...]|all>]
  node bin/packs.js vendor-status [<pack[,pack...]|all>]
  node bin/packs.js vendor-dirty [<pack[,pack...]|all>]
  node bin/packs.js report [latest|list|summary] [--kind <prefix>]
  node bin/packs.js uninstall <pack> [--host claude|codex|all] [--remove-lock] [--remove-vendor]`);
}

function parseCsvArg(value) {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function parseSourceAssignments(value) {
  return parseCsvArg(value).map((entry) => {
    const [pack, mode] = entry.split('=').map((item) => item && item.trim());
    if (!pack || !mode) throw new Error(`非法 source 声明: ${entry}`);
    return { pack, mode };
  });
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const options = {
    force: false,
    host: 'all',
    optionalPolicy: null,
    addRequired: [],
    addOptional: [],
    remove: [],
    setSource: [],
    applyDocs: false,
    removeLock: false,
    removeVendor: false,
    checkOnly: false,
    jsonOutput: false,
    kind: null,
    subject: null,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--force') options.force = true;
    else if (arg === '--host' && args[i + 1]) options.host = args[++i];
    else if (arg === '--optional-policy' && args[i + 1]) options.optionalPolicy = args[++i];
    else if (arg === '--add-required' && args[i + 1]) options.addRequired.push(...parseCsvArg(args[++i]));
    else if (arg === '--add-optional' && args[i + 1]) options.addOptional.push(...parseCsvArg(args[++i]));
    else if (arg === '--remove' && args[i + 1]) options.remove.push(...parseCsvArg(args[++i]));
    else if (arg === '--set-source' && args[i + 1]) options.setSource.push(...parseSourceAssignments(args[++i]));
    else if (arg === '--apply-docs') options.applyDocs = true;
    else if (arg === '--remove-lock') options.removeLock = true;
    else if (arg === '--remove-vendor') options.removeVendor = true;
    else if (arg === '--check') options.checkOnly = true;
    else if (arg === '--json') options.jsonOutput = true;
    else if (arg === '--kind' && args[i + 1]) options.kind = args[++i];
    else if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else if (!arg.startsWith('--') && options.subject === null) {
      options.subject = arg;
    } else {
      throw new Error(`未知参数: ${arg}`);
    }
  }

  return { command, options };
}

function resolveHosts(hostArg) {
  if (!hostArg || hostArg === 'all') return HOST_NAMES.slice();
  if (!HOST_NAMES.includes(hostArg)) throw new Error(`不支持的 host: ${hostArg}`);
  return [hostArg];
}

function applyMutations(lock, options) {
  const next = normalizeProjectPackLock(lock);
  const hosts = resolveHosts(options.host);

  hosts.forEach((host) => {
    const cfg = next.hosts[host];
    options.remove.forEach((pack) => {
      cfg.required = cfg.required.filter((item) => item !== pack);
      cfg.optional = cfg.optional.filter((item) => item !== pack);
    });
    options.addRequired.forEach((pack) => {
      cfg.optional = cfg.optional.filter((item) => item !== pack);
      cfg.required.push(pack);
      cfg.sources[pack] = cfg.sources[pack] || 'pinned';
    });
    options.addOptional.forEach((pack) => {
      cfg.required = cfg.required.filter((item) => item !== pack);
      cfg.optional.push(pack);
      cfg.sources[pack] = cfg.sources[pack] || 'pinned';
    });
    options.remove.forEach((pack) => {
      delete cfg.sources[pack];
    });
    options.setSource.forEach(({ pack, mode }) => {
      cfg.sources[pack] = mode;
    });
    cfg.required = uniqueSorted(cfg.required);
    cfg.optional = uniqueSorted(cfg.optional);
    if (options.optionalPolicy) cfg.optional_policy = options.optionalPolicy;
  });

  return normalizeProjectPackLock(next);
}

function writeLock(lockPath, lock) {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

function initCommand(projectRoot, options) {
  const lockPath = path.join(projectRoot, PROJECT_PACKS_LOCK_REL);
  if (fs.existsSync(lockPath) && !options.force) {
    throw new Error(`packs.lock 已存在: ${lockPath}；如需覆盖请加 --force`);
  }

  let lock = buildDefaultProjectPackLock(projectRoot);
  lock = applyMutations(lock, options);

  const errors = validateProjectPackLock(lock, projectRoot);
  if (errors.length > 0) throw new Error(errors.join('\n'));

  writeLock(lockPath, lock);
  console.log(`已初始化: ${lockPath}`);
}

function mergeWithDefaults(projectRoot, current) {
  const defaults = buildDefaultProjectPackLock(projectRoot);
  const next = normalizeProjectPackLock(current);

  HOST_NAMES.forEach((host) => {
    next.hosts[host].required = uniqueSorted([...next.hosts[host].required, ...defaults.hosts[host].required]);
    next.hosts[host].optional = uniqueSorted([...next.hosts[host].optional, ...defaults.hosts[host].optional]);
    next.hosts[host].sources = {
      ...defaults.hosts[host].sources,
      ...next.hosts[host].sources,
    };
  });

  return next;
}

function updateCommand(projectRoot, options) {
  const payload = readProjectPackLock(projectRoot);
  const lockPath = path.join(projectRoot, PROJECT_PACKS_LOCK_REL);
  const base = payload ? payload.lock : buildDefaultProjectPackLock(projectRoot);
  const merged = mergeWithDefaults(projectRoot, base);
  const next = applyMutations(merged, options);
  const errors = validateProjectPackLock(next, projectRoot);
  if (errors.length > 0) throw new Error(errors.join('\n'));

  writeLock(lockPath, next);
  console.log(`已更新: ${lockPath}`);
}

function bootstrapCommand(projectRoot, options) {
  const lockPath = path.join(projectRoot, PROJECT_PACKS_LOCK_REL);
  const payload = readProjectPackLock(projectRoot);
  const base = payload ? mergeWithDefaults(projectRoot, payload.lock) : buildDefaultProjectPackLock(projectRoot);
  const next = applyMutations(base, options);
  const errors = validateProjectPackLock(next, projectRoot);
  if (errors.length > 0) throw new Error(errors.join('\n'));

  if (fs.existsSync(lockPath) && !options.force && !payload) {
    throw new Error(`packs.lock 已存在: ${lockPath}；如需覆盖请加 --force`);
  }

  writeLock(lockPath, next);
  writeBootstrapSnippets(projectRoot, next);
  if (options.applyDocs) {
    const applied = applyBootstrapDocs(projectRoot, next);
    applied.forEach((entry) => console.log(`文档片段 ${entry.action}: ${entry.filePath}`));
  }
  console.log(`已引导项目 pack 配置: ${lockPath}`);
}

function checkCommand(projectRoot) {
  const payload = readProjectPackLock(projectRoot);
  if (!payload) throw new Error(`未找到 ${PROJECT_PACKS_LOCK_REL}`);

  const errors = validateProjectPackLock(payload.lock, projectRoot);
  if (errors.length > 0) {
    errors.forEach((error) => console.error(`✘ ${error}`));
    process.exit(1);
  }

  console.log(`packs.lock 校验通过: ${payload.path}`);
}

function diffCommand(projectRoot) {
  const payload = readProjectPackLock(projectRoot);
  if (!payload) throw new Error(`未找到 ${PROJECT_PACKS_LOCK_REL}`);

  const defaults = buildDefaultProjectPackLock(projectRoot);
  const diffs = diffProjectPackLocks(payload.lock, defaults);
  if (diffs.length === 0) {
    console.log('packs.lock 与默认模板一致');
    return;
  }

  diffs.forEach((diff) => {
    console.log(`[${diff.host}]`);
    if (diff.addedRequired.length > 0) console.log(`  + required: ${diff.addedRequired.join(', ')}`);
    if (diff.removedRequired.length > 0) console.log(`  - required: ${diff.removedRequired.join(', ')}`);
    if (diff.addedOptional.length > 0) console.log(`  + optional: ${diff.addedOptional.join(', ')}`);
    if (diff.removedOptional.length > 0) console.log(`  - optional: ${diff.removedOptional.join(', ')}`);
    if (diff.optionalPolicy.from !== diff.optionalPolicy.to) {
      console.log(`  policy: ${diff.optionalPolicy.from} -> ${diff.optionalPolicy.to}`);
    }
    Object.entries(diff.sourceChanges).forEach(([pack, change]) => {
      console.log(`  source: ${pack}: ${change.from || 'unset'} -> ${change.to || 'unset'}`);
    });
  });
}

function resolvePackSubjects(projectRoot, subject, predicate = null) {
  const allPacks = listPackNames(projectRoot).filter((pack) => pack !== 'abyss');
  let packs;
  if (!subject || subject === 'all') packs = allPacks;
  else packs = uniqueSorted(parseCsvArg(subject));

  if (predicate) packs = packs.filter(predicate);
  return packs;
}

function vendorPullCommand(projectRoot, subject) {
  const packs = resolvePackSubjects(projectRoot, subject);
  if (packs.length === 0) throw new Error('没有可 vendor 的 pack');

  packs.forEach((pack) => {
    const report = syncPackVendor(projectRoot, pack);
    console.log(`${report.pack}: ${report.action} -> ${report.vendorDir} @ ${report.commit}`);
  });
}

function vendorSyncCommand(projectRoot, subject, options) {
  const payload = readProjectPackLock(projectRoot);
  const lock = payload ? normalizeProjectPackLock(payload.lock) : buildDefaultProjectPackLock(projectRoot);
  const localPacks = new Set();
  HOST_NAMES.forEach((host) => {
    Object.entries(lock.hosts[host].sources || {}).forEach(([pack, source]) => {
      if (source === 'local') localPacks.add(pack);
    });
  });

  const packs = resolvePackSubjects(projectRoot, subject, (pack) => subject ? true : localPacks.has(pack));
  if (packs.length === 0) {
    console.log('无 local source pack 需要 vendor sync');
    return;
  }

  if (options.checkOnly) {
    let hasIssues = false;
    packs.forEach((pack) => {
      const status = getPackVendorStatus(projectRoot, pack);
      if (!status.exists || status.dirty || status.drifted) {
        hasIssues = true;
        console.log(`${pack}: exists=${status.exists} dirty=${status.dirty} drifted=${status.drifted} current=${status.currentCommit || 'none'} target=${status.targetCommit}`);
      }
    });
    if (hasIssues) process.exit(1);
    console.log('所有 local source pack 都已 vendor sync');
    return;
  }

  packs.forEach((pack) => {
    const report = syncPackVendor(projectRoot, pack);
    console.log(`${report.pack}: ${report.action} -> ${report.vendorDir} @ ${report.commit}`);
  });
}

function vendorStatusCommand(projectRoot, subject) {
  const packs = resolvePackSubjects(projectRoot, subject);
  if (packs.length === 0) {
    console.log('没有可检查的 vendor pack');
    return;
  }

  packs.forEach((pack) => {
    const status = getPackVendorStatus(projectRoot, pack);
    const dirty = status.dirty ? 'dirty' : 'clean';
    const drift = status.drifted ? 'drifted' : 'aligned';
    const exists = status.exists ? 'present' : 'missing';
    console.log(`${pack}: ${exists} ${dirty} ${drift} current=${status.currentCommit || 'none'} target=${status.targetCommit}`);
  });
}

function vendorDirtyCommand(projectRoot, subject) {
  const packs = resolvePackSubjects(projectRoot, subject);
  if (packs.length === 0) {
    console.log('没有可检查的 vendor pack');
    return;
  }

  let hasIssues = false;
  packs.forEach((pack) => {
    const status = getPackVendorStatus(projectRoot, pack);
    if (status.dirty || status.drifted || !status.exists) {
      hasIssues = true;
      console.log(`${pack}: exists=${status.exists} dirty=${status.dirty} drifted=${status.drifted} current=${status.currentCommit || 'none'} target=${status.targetCommit}`);
    }
  });

  if (hasIssues) process.exit(1);
  console.log('所有 vendor pack 都是 clean + aligned');
}

function reportCommand(projectRoot, subject, options) {
  const action = subject || 'latest';
  if (!['latest', 'list', 'summary'].includes(action)) {
    throw new Error(`report 仅支持 latest|list|summary，当前: ${action}`);
  }

  if (action === 'list') {
    const reports = listReportArtifacts(projectRoot, options.kind || null);
    if (reports.length === 0) {
      console.log('无 report artifact');
      return;
    }
    if (options.jsonOutput) {
      console.log(JSON.stringify(reports, null, 2));
      return;
    }
    reports.forEach((report) => {
      console.log(`${report.name}  ${report.path}`);
    });
    return;
  }

  if (action === 'summary') {
    const summary = summarizeReportArtifacts(projectRoot, options.kind || null);
    if (summary.length === 0) {
      console.log('无 report artifact');
      return;
    }
    if (options.jsonOutput) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }
    summary.forEach((entry) => {
      if (entry.target) {
        const statuses = entry.packReports.map((report) => `${report.pack}:${report.status}`).join(', ');
        console.log(`${entry.kind} target=${entry.target}${statuses ? ` packs=[${statuses}]` : ''}`);
      } else if (entry.pack) {
        const actions = entry.reports.map((report) => `${report.host}:${report.action}`).join(', ');
        console.log(`${entry.kind} pack=${entry.pack}${actions ? ` actions=[${actions}]` : ''}`);
      } else {
        console.log(`${entry.kind} path=${entry.path}`);
      }
    });
    return;
  }

  const latest = readLatestReportArtifact(projectRoot, options.kind || null);
  if (!latest) {
    console.log('无 report artifact');
    return;
  }

  if (options.jsonOutput) {
    console.log(JSON.stringify(latest, null, 2));
    return;
  }

  console.log(latest.path);
  console.log(JSON.stringify(latest.data, null, 2));
}

function resolveHomeRoot(rootName) {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) throw new Error('缺少 HOME');
  if (rootName === 'claude') return path.join(home, '.claude');
  if (rootName === 'codex') return path.join(home, '.codex');
  if (rootName === 'agents') return path.join(home, '.agents');
  if (rootName === 'gemini') return path.join(home, '.gemini');
  throw new Error(`未知安装根: ${rootName}`);
}

function listSkillDirectories(skillRootPath) {
  if (!fs.existsSync(skillRootPath)) return [];
  return fs.readdirSync(skillRootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillRootPath, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();
}

function uninstallPackForHost(projectRoot, packName, host) {
  const hostConfig = getPackHostConfig(projectRoot, packName, host);
  if (!hostConfig || !hostConfig.uninstall) {
    return [{ host, path: `${packName}`, action: 'unsupported' }];
  }

  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) throw new Error('缺少 HOME');
  const reports = [];

  const uninstallConfig = hostConfig.uninstall;
  const runtimeRoot = path.join(resolveHomeRoot(uninstallConfig.runtimeRoot.root), uninstallConfig.runtimeRoot.path);

  if (uninstallConfig.commandRoot) {
    const commandRoot = path.join(resolveHomeRoot(uninstallConfig.commandRoot.root), uninstallConfig.commandRoot.path);
    const commandAliases = uninstallConfig.commandAliases || {};
    const commandExtension = uninstallConfig.commandExtension || '.md';
    const names = uninstallConfig.commandsFromRuntime ? listSkillDirectories(runtimeRoot) : [];
    const commandNames = uniqueSorted([
      ...names,
      ...Object.values(commandAliases).flat(),
      ...Object.keys(commandAliases),
    ]);

    commandNames.forEach((name) => {
      const commandPath = path.join(commandRoot, `${name}${commandExtension}`);
      if (fs.existsSync(commandPath)) {
        fs.rmSync(commandPath, { force: true });
        reports.push({ host, path: commandPath, action: 'removed' });
      }
    });
  }

  if (fs.existsSync(runtimeRoot)) {
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
    reports.push({ host, path: runtimeRoot, action: 'removed' });
  } else {
    reports.push({ host, path: runtimeRoot, action: 'missing' });
  }

  return reports;
}

function uninstallCommand(projectRoot, subject, options) {
  const pack = subject;
  if (!pack) throw new Error('uninstall 需要指定 pack');
  if (pack === 'abyss') throw new Error('core pack abyss 不支持单独卸载');
  getPack(projectRoot, pack);

  const hosts = resolveHosts(options.host);
  const reports = [];
  const reporting = getPackReporting(projectRoot, pack);
  const packLabel = reporting.label;

  hosts.forEach((host) => {
    reports.push(...uninstallPackForHost(projectRoot, pack, host));
  });

  if (options.removeVendor) {
    const vendor = removePackVendor(projectRoot, pack);
    reports.push({ host: 'vendor', path: vendor.vendorDir, action: vendor.removed ? 'removed' : 'missing' });
  }

  if (options.removeLock) {
    const payload = readProjectPackLock(projectRoot);
    if (payload) {
      const next = applyMutations(payload.lock, {
        host: options.host,
        remove: [pack],
        addRequired: [],
        addOptional: [],
        setSource: [],
        optionalPolicy: null,
      });
      writeLock(payload.path, next);
      reports.push({ host: 'lock', path: payload.path, action: 'updated' });
    }
  }

  reports.forEach((report) => {
    console.log(`[${report.host}] ${packLabel} ${report.action}: ${report.path}`);
  });
  const reportPath = writeReportArtifact(projectRoot, `pack-uninstall-${reporting.artifactPrefix}`, {
    pack,
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    options: {
      host: options.host,
      removeLock: options.removeLock,
      removeVendor: options.removeVendor,
    },
    reports,
  });
  console.log(`report: ${reportPath}`);
}

function main() {
  const { command, options } = parseArgs(process.argv);
  const projectRoot = process.cwd();

  if (!command || !['init', 'update', 'bootstrap', 'check', 'diff', 'vendor-pull', 'vendor-sync', 'vendor-status', 'vendor-dirty', 'report', 'uninstall'].includes(command)) {
    usage();
    process.exit(command ? 1 : 0);
  }

  if (options.optionalPolicy && !OPTIONAL_POLICIES.has(options.optionalPolicy)) {
    throw new Error(`optional-policy 必须是 ${[...OPTIONAL_POLICIES].join('|')}`);
  }
  options.setSource.forEach(({ mode }) => {
    if (!PACK_SOURCE_MODES.has(mode)) {
      throw new Error(`source 模式必须是 ${[...PACK_SOURCE_MODES].join('|')}`);
    }
  });

  if (command === 'init') initCommand(projectRoot, options);
  else if (command === 'update') updateCommand(projectRoot, options);
  else if (command === 'bootstrap') bootstrapCommand(projectRoot, options);
  else if (command === 'diff') diffCommand(projectRoot);
  else if (command === 'vendor-pull') vendorPullCommand(projectRoot, options.subject);
  else if (command === 'vendor-sync') vendorSyncCommand(projectRoot, options.subject, options);
  else if (command === 'vendor-status') vendorStatusCommand(projectRoot, options.subject);
  else if (command === 'vendor-dirty') vendorDirtyCommand(projectRoot, options.subject);
  else if (command === 'report') reportCommand(projectRoot, options.subject, options);
  else if (command === 'uninstall') uninstallCommand(projectRoot, options.subject, options);
  else checkCommand(projectRoot);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`✘ ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  parseArgs,
  applyMutations,
  mergeWithDefaults,
  renderReadmeSnippet,
  renderContributingSnippet,
  applyBootstrapDocs,
};
