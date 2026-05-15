'use strict';

// bin/lib/gstack/installer.js
// 统一 install 入口：按 hostName 分发到对应 strategy。
// 调用方提供 sourceMode + projectRoot + fallback，本模块负责：
//   1. 通过 core.resolveGstackSource 解析 source root（pinned/local/disabled + fallback）
//   2. 路由到 strategies/<host>.installToHost
//   3. 把 strategy 结果包装成 {installed, sourceMode, reason} 给 core-install 用

const { resolveGstackSource } = require('./core');

const STRATEGIES = {
  claude: require('./strategies/claude'),
  codex: require('./strategies/codex'),
  gemini: require('./strategies/gemini'),
  openclaw: require('./strategies/openclaw'),
};

function installGstackPack(hostName, options = {}) {
  const strategy = STRATEGIES[hostName];
  if (!strategy) {
    throw new Error(`gstack: 不支持的 host ${hostName}`);
  }

  const {
    HOME,
    backupDir,
    manifest,
    info = () => {},
    ok = () => {},
    warn = () => {},
    env = process.env,
    sourceMode = 'pinned',
    projectRoot = null,
    fallback = false,
  } = options;

  const resolved = resolveGstackSource({ HOME, env, warn, sourceMode, projectRoot, hostName, fallback });
  if (!resolved.sourceRoot) {
    return { installed: false, sourceMode: resolved.mode, reason: resolved.reason };
  }

  const result = strategy.installToHost({
    HOME, backupDir, manifest,
    sourceRoot: resolved.sourceRoot,
    info, ok, warn,
  });

  return {
    installed: result.installed,
    sourceMode: resolved.mode,
    reason: result.reason || resolved.reason || null,
  };
}

module.exports = { installGstackPack, STRATEGIES };
