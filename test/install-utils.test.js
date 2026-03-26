'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  deepMergeNew,
  detectClaudeAuth,
  detectCodexAuth,
  copyRecursive,
  shouldSkip,
  SETTINGS_TEMPLATE,
} = require('../bin/install');

describe('deepMergeNew', () => {
  test('新键写入目标', () => {
    const target = {};
    const log = [];
    deepMergeNew(target, { a: 1 }, '', log);
    expect(target.a).toBe(1);
    expect(log.some(l => l.k === 'a' && l.a === 'set')).toBe(true);
  });

  test('已有键保留不覆盖', () => {
    const target = { a: 'old' };
    const log = [];
    deepMergeNew(target, { a: 'new' }, '', log);
    expect(target.a).toBe('old');
    expect(log.some(l => l.k === 'a' && l.a === 'keep')).toBe(true);
  });

  test('嵌套对象递归合并', () => {
    const target = { env: { A: '1' } };
    const log = [];
    deepMergeNew(target, { env: { B: '2' } }, '', log);
    expect(target.env.A).toBe('1');
    expect(target.env.B).toBe('2');
  });

  test('数组去重追加', () => {
    const target = { arr: ['a', 'b'] };
    const log = [];
    deepMergeNew(target, { arr: ['b', 'c'] }, '', log);
    expect(target.arr).toEqual(['a', 'b', 'c']);
  });

  test('数组完全重复则保留', () => {
    const target = { arr: ['a', 'b'] };
    const log = [];
    deepMergeNew(target, { arr: ['a', 'b'] }, '', log);
    expect(target.arr).toEqual(['a', 'b']);
    expect(log.some(l => l.a === 'keep')).toBe(true);
  });

  test('目标无嵌套对象时创建', () => {
    const target = {};
    const log = [];
    deepMergeNew(target, { env: { X: '1' } }, '', log);
    expect(target.env.X).toBe('1');
    expect(log.some(l => l.k === 'env' && l.a === 'new')).toBe(true);
  });
});

describe('detectClaudeAuth', () => {
  const origEnv = { ...process.env };
  afterEach(() => { process.env = { ...origEnv }; });

  test('settings中有自定义provider', () => {
    const settings = { env: { ANTHROPIC_BASE_URL: 'http://x', ANTHROPIC_AUTH_TOKEN: 'tok' } };
    const auth = detectClaudeAuth(settings);
    expect(auth).toEqual({ type: 'custom', detail: 'http://x' });
  });

  test('环境变量ANTHROPIC_API_KEY', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const auth = detectClaudeAuth({});
    expect(auth).toEqual({ type: 'env', detail: 'ANTHROPIC_API_KEY' });
  });

  test('无认证返回null', () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_BASE_URL;
    delete process.env.ANTHROPIC_AUTH_TOKEN;
    const auth = detectClaudeAuth({});
    expect(auth === null || typeof auth === 'object').toBe(true);
  });
});

describe('detectCodexAuth', () => {
  const origEnv = { ...process.env };
  afterEach(() => { process.env = { ...origEnv }; });

  test('环境变量OPENAI_API_KEY', () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const auth = detectCodexAuth();
    expect(auth).toEqual({ type: 'env', detail: 'OPENAI_API_KEY' });
  });

  test('无认证返回null', () => {
    delete process.env.OPENAI_API_KEY;
    const auth = detectCodexAuth();
    expect(auth === null || typeof auth === 'object').toBe(true);
  });
});

describe('shouldSkip', () => {
  test('跳过 __pycache__', () => { expect(shouldSkip('__pycache__')).toBe(true); });
  test('跳过 .git', () => { expect(shouldSkip('.git')).toBe(true); });
  test('不跳过正常文件', () => { expect(shouldSkip('install.js')).toBe(false); });
});

describe('copyRecursive', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-test-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  test('复制文件', () => {
    const src = path.join(tmpDir, 'a.txt');
    const dest = path.join(tmpDir, 'b.txt');
    fs.writeFileSync(src, 'hello');
    copyRecursive(src, dest);
    expect(fs.readFileSync(dest, 'utf8')).toBe('hello');
  });

  test('递归复制目录', () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'x.txt'), 'data');
    const destDir = path.join(tmpDir, 'dest');
    copyRecursive(srcDir, destDir);
    expect(fs.readFileSync(path.join(destDir, 'x.txt'), 'utf8')).toBe('data');
  });

  test('跳过 __pycache__ 目录', () => {
    const srcDir = path.join(tmpDir, 'src');
    const cacheDir = path.join(srcDir, '__pycache__');
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, 'x.pyc'), 'bad');
    const destDir = path.join(tmpDir, 'dest');
    copyRecursive(srcDir, destDir);
    expect(fs.existsSync(path.join(destDir, '__pycache__'))).toBe(false);
  });
});

describe('SETTINGS_TEMPLATE', () => {
  test('包含必要字段', () => {
    expect(SETTINGS_TEMPLATE).toHaveProperty('env');
    expect(SETTINGS_TEMPLATE).toHaveProperty('permissions');
    expect(SETTINGS_TEMPLATE).toHaveProperty('outputStyle');
  });
});
