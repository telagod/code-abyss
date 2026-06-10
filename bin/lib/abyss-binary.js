'use strict';

// bin/lib/abyss-binary.js
// --with-abyss：下载 abyss 预编译二进制到 ~/.code-abyss/bin/
//
// 设计约束：
//   - 落点固定 ~/.code-abyss/bin/abyss，不污染用户 PATH——hook 薄壳与
//     detectAbyss() 都内建该路径兜底，下载即生效。
//   - 零额外依赖：Node 18+ 内建 fetch + 系统 tar（Windows 10+ 的 bsdtar
//     同时支持 .tar.gz 与 .zip），与 abyss npm wrapper 同一套已验证逻辑。
//   - 下载失败不阻断安装流程：报告原因 + 给出手动安装路，由 finish 收尾提示。

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ABYSS_REPO = 'telagod/abyss';

function resolveReleaseTarget() {
  const arch = { x64: 'x86_64', arm64: 'aarch64' }[process.arch];
  if (!arch) return null;
  switch (process.platform) {
    case 'linux': return `${arch}-unknown-linux-gnu`;
    case 'darwin': return `${arch}-apple-darwin`;
    case 'win32': return arch === 'x86_64' ? 'x86_64-pc-windows-msvc' : null;
    default: return null;
  }
}

function assetName(target) {
  return process.platform === 'win32' ? `abyss-${target}.zip` : `abyss-${target}.tar.gz`;
}

function releaseUrl(target, version) {
  const asset = assetName(target);
  return version
    ? `https://github.com/${ABYSS_REPO}/releases/download/v${version}/${asset}`
    : `https://github.com/${ABYSS_REPO}/releases/latest/download/${asset}`;
}

// 返回 { installed: true, binPath } 或 { installed: false, reason }
async function installAbyssBinary({ HOME = os.homedir(), version = null, info = () => {}, warn = () => {} } = {}) {
  const target = resolveReleaseTarget();
  if (!target) {
    return { installed: false, reason: `不支持的平台: ${process.platform}/${process.arch}` };
  }

  const binDir = path.join(HOME, '.code-abyss', 'bin');
  const binName = process.platform === 'win32' ? 'abyss.exe' : 'abyss';
  const binPath = path.join(binDir, binName);
  const url = releaseUrl(target, version);
  info(`下载: ${url}`);

  let res;
  try {
    res = await fetch(url, { redirect: 'follow' });
  } catch (e) {
    return { installed: false, reason: `网络错误: ${e.message}` };
  }
  if (!res.ok) {
    return { installed: false, reason: `HTTP ${res.status}（release 资产不可达）` };
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-dl-'));
  try {
    const archivePath = path.join(tmp, assetName(target));
    fs.writeFileSync(archivePath, Buffer.from(await res.arrayBuffer()));
    // bsdtar（Windows 10+ 自带）对 .tar.gz 和 .zip 都认
    execFileSync('tar', ['-xf', archivePath, '-C', tmp]);

    // 归档内可能是裸二进制或 abyss-<target>/ 目录，递归找
    const found = findBinary(tmp, binName);
    if (!found) return { installed: false, reason: '归档内未找到 abyss 二进制' };

    fs.mkdirSync(binDir, { recursive: true });
    fs.copyFileSync(found, binPath);
    if (process.platform !== 'win32') fs.chmodSync(binPath, 0o755);
    return { installed: true, binPath };
  } catch (e) {
    return { installed: false, reason: `解压失败: ${e.message}` };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
    void warn;
  }
}

function findBinary(dir, binName) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isFile() && e.name === binName) return p;
    if (e.isDirectory()) {
      const nested = findBinary(p, binName);
      if (nested) return nested;
    }
  }
  return null;
}

module.exports = {
  ABYSS_REPO,
  resolveReleaseTarget,
  assetName,
  releaseUrl,
  installAbyssBinary,
};
