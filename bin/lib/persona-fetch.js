'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const os = require('os');
const { validatePersonaVoiceCard } = require('./persona-voice-card');

const CACHE_BASE = path.join(os.homedir(), '.code-abyss', 'personas');

function getCacheDir(slug) {
  return path.join(CACHE_BASE, slug);
}

function isPersonaCached(slug) {
  return fs.existsSync(path.join(getCacheDir(slug), `${slug}.json`));
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

// Fetches the single flat `<slug>.json` (persona-voice-card v1.0) — no more
// persona-card.json/<slug>.md/examples.md/posthistory.md quartet. Validated
// before it ever touches disk: a remote persona that fails schema validation
// is a rejected fetch, not a cached file for the render path to later fall
// back away from.
async function fetchPersona(slug, remoteBase) {
  const cacheDir = getCacheDir(slug);
  fs.mkdirSync(cacheDir, { recursive: true });

  const base = remoteBase.replace(/\/+$/, '');
  const cardUrl = `${base}/${slug}.json`;
  const raw = await fetch(cardUrl);
  if (!raw) {
    throw new Error(`远程人格 ${slug} 不存在: ${cardUrl} 返回非 200`);
  }

  let card;
  try {
    card = JSON.parse(raw);
  } catch (e) {
    throw new Error(`远程人格 ${slug} 的 voice card 解析失败: ${e.message}`);
  }
  const { valid, errors } = validatePersonaVoiceCard(card);
  if (!valid) {
    throw new Error(`远程人格 ${slug} 的 voice card 未通过校验，拒绝缓存:\n  ${errors.join('\n  ')}`);
  }

  fs.writeFileSync(path.join(cacheDir, `${slug}.json`), raw);
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
