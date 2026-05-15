'use strict';

const path = require('path');
const {
  normalizePath, classifyFile, parsePorcelainLine,
  parseNameStatusLine, identifyModules
} = require(path.join(
  __dirname, '..', 'skills', 'analyzing-changes', 'scripts', 'change_analyzer.js'
));

describe('normalizePath', () => {
  test('去除引号', () => {
    expect(normalizePath('"src/a.js"')).toBe('src/a.js');
  });
  test('去除 ./ 前缀', () => {
    expect(normalizePath('./src/a.js')).toBe('src/a.js');
  });
  test('trim 空白', () => {
    expect(normalizePath('  src/a.js  ')).toBe('src/a.js');
  });
  test('普通路径不变', () => {
    expect(normalizePath('src/a.js')).toBe('src/a.js');
  });
});

describe('classifyFile', () => {
  test('.py 文件识别为代码', () => {
    const r = classifyFile('src/main.py');
    expect(r.is_code).toBe(true);
    expect(r.is_doc).toBe(false);
  });
  test('.md 文件识别为文档', () => {
    const r = classifyFile('README.md');
    expect(r.is_doc).toBe(true);
    expect(r.is_code).toBe(false);
  });
  test('.test.js 文件识别为测试', () => {
    const r = classifyFile('src/foo.test.js');
    expect(r.is_test).toBe(true);
  });
  test('package.json 识别为配置', () => {
    const r = classifyFile('package.json');
    expect(r.is_config).toBe(true);
  });
  test('.yaml 识别为配置', () => {
    const r = classifyFile('config/app.yaml');
    expect(r.is_config).toBe(true);
  });
  test('默认 type 为 modified', () => {
    expect(classifyFile('a.js').type).toBe('modified');
  });
});

describe('parsePorcelainLine', () => {
  test('解析新增文件 ??', () => {
    const r = parsePorcelainLine('?? src/new.js');
    expect(r.type).toBe('added');
    expect(r.path).toBe('src/new.js');
  });
  test('解析修改文件 M', () => {
    const r = parsePorcelainLine(' M src/old.js');
    expect(r.type).toBe('modified');
  });
  test('解析删除文件 D', () => {
    const r = parsePorcelainLine(' D removed.js');
    expect(r.type).toBe('deleted');
  });
  test('解析重命名 R', () => {
    const r = parsePorcelainLine('R  old.js -> new.js');
    expect(r.type).toBe('renamed');
    expect(r.path).toBe('new.js');
  });
  test('短行返回 null', () => {
    expect(parsePorcelainLine('ab')).toBeNull();
  });
  test('空 raw 返回 null', () => {
    expect(parsePorcelainLine('M  ')).toBeNull();
  });
});

describe('parseNameStatusLine', () => {
  test('解析 Added', () => {
    const r = parseNameStatusLine('A\tsrc/new.js');
    expect(r.type).toBe('added');
    expect(r.path).toBe('src/new.js');
  });
  test('解析 Modified', () => {
    const r = parseNameStatusLine('M\tsrc/old.js');
    expect(r.type).toBe('modified');
  });
  test('解析 Deleted', () => {
    const r = parseNameStatusLine('D\tremoved.js');
    expect(r.type).toBe('deleted');
  });
  test('解析 Renamed (取最后路径)', () => {
    const r = parseNameStatusLine('R100\told.js\tnew.js');
    expect(r.type).toBe('renamed');
    expect(r.path).toBe('new.js');
  });
  test('无 tab 返回 null', () => {
    expect(parseNameStatusLine('nope')).toBeNull();
  });
});

describe('identifyModules', () => {
  test('根目录文件归入 "."', () => {
    const mods = identifyModules([{ path: 'README.md' }]);
    expect(mods.has('.')).toBe(true);
  });
  test('子目录文件归入首级目录', () => {
    const mods = identifyModules([{ path: 'src/lib/foo.js' }]);
    expect(mods.has('src')).toBe(true);
  });
});
