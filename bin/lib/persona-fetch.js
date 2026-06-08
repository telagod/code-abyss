'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const os = require('os');

const CACHE_BASE = path.join(os.homedir(), '.code-abyss', 'personas');

function getCacheDir(slug) {
  return path.join(CACHE_BASE, slug);
}

function isPersonaCached(slug) {
  const dir = getCacheDir(slug);
  return fs.existsSync(path.join(dir, 'persona-card.json'))
    && fs.existsSync(path.join(dir, `${slug}.md`));
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'code-abyss' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchPersona(slug, remoteBase) {
  const cacheDir = getCacheDir(slug);
  fs.mkdirSync(cacheDir, { recursive: true });

  const base = remoteBase.replace(/\/+$/, '');

  const cardUrl = `${base}/${slug}/persona-card.json`;
  const cardContent = await fetch(cardUrl);
  if (!cardContent) {
    throw new Error(`远程人格 ${slug} 不存在: ${cardUrl} 返回非 200`);
  }
  fs.writeFileSync(path.join(cacheDir, 'persona-card.json'), cardContent);

  const identityUrl = `${base}/${slug}.md`;
  const identityContent = await fetch(identityUrl);
  if (!identityContent) {
    throw new Error(`远程人格 ${slug} 缺少 identity 文件: ${identityUrl}`);
  }
  fs.writeFileSync(path.join(cacheDir, `${slug}.md`), identityContent);

  for (const optional of ['examples.md', 'posthistory.md']) {
    const url = `${base}/${slug}/${optional}`;
    const content = await fetch(url);
    if (content) {
      fs.writeFileSync(path.join(cacheDir, optional), content);
    }
  }

  return cacheDir;
}

async function ensurePersona(slug, remoteBase) {
  if (isPersonaCached(slug)) return getCacheDir(slug);
  return fetchPersona(slug, remoteBase);
}

module.exports = {
  getCacheDir,
  isPersonaCached,
  fetchPersona,
  ensurePersona,
  CACHE_BASE,
};
