'use strict';

const path = require('path');
const {
  parseCliArgs, buildReport, countBySeverity, hasFatal, SEP, DASH, ICONS
} = require(path.join(
  __dirname, '..', 'skills', '_lib', 'shared.js'
));

describe('parseCliArgs', () => {
  test('默认值', () => {
    const r = parseCliArgs(['node', 'script']);
    expect(r.target).toBe('.');
    expect(r.verbose).toBe(false);
    expect(r.json).toBe(false);
  });

  test('解析 -v 和 --json', () => {
    const r = parseCliArgs(['node', 'script', '-v', '--json', '/tmp']);
    expect(r.verbose).toBe(true);
    expect(r.json).toBe(true);
    expect(r.target).toBe('/tmp');
  });

  test('解析 --mode', () => {
    const r = parseCliArgs(['node', 'script', '--mode', 'staged']);
    expect(r.mode).toBe('staged');
  });

  test('解析 --exclude', () => {
    const r = parseCliArgs(['node', 'script', '--exclude', 'a', 'b'], { exclude: [] });
    expect(r.exclude).toEqual(['a', 'b']);
  });

  test('--help 标记', () => {
    const r = parseCliArgs(['node', 'script', '--help']);
    expect(r.help).toBe(true);
  });

  test('额外默认值合并', () => {
    const r = parseCliArgs(['node', 'script'], { foo: 'bar' });
    expect(r.foo).toBe('bar');
  });
});

describe('countBySeverity', () => {
  test('正确计数', () => {
    const issues = [
      { severity: 'error' }, { severity: 'error' },
      { severity: 'warning' }, { severity: 'info' },
    ];
    const c = countBySeverity(issues);
    expect(c.error).toBe(2);
    expect(c.warning).toBe(1);
    expect(c.info).toBe(1);
  });

  test('空数组', () => {
    expect(countBySeverity([])).toEqual({});
  });
});

describe('hasFatal', () => {
  test('有error返回true', () => {
    expect(hasFatal([{ severity: 'error' }])).toBe(true);
  });

  test('无error返回false', () => {
    expect(hasFatal([{ severity: 'warning' }])).toBe(false);
  });

  test('自定义致命级别', () => {
    expect(hasFatal([{ severity: 'critical' }], ['critical'])).toBe(true);
    expect(hasFatal([{ severity: 'high' }], ['critical'])).toBe(false);
  });
});

describe('buildReport', () => {
  test('生成包含标题和字段的报告', () => {
    const report = buildReport('测试报告', { '路径': '/tmp' }, [], false);
    expect(report).toContain('测试报告');
    expect(report).toContain('/tmp');
    expect(report).toContain(SEP);
  });

  test('包含问题列表', () => {
    const issues = [{ severity: 'error', message: '测试错误', file_path: 'a.js', line_number: 1 }];
    const report = buildReport('报告', {}, issues, false);
    expect(report).toContain('测试错误');
    expect(report).toContain('问题列表');
  });

  test('分组模式', () => {
    const issues = [
      { severity: 'error', message: 'err1', category: 'A', file_path: '', line_number: null },
      { severity: 'warning', message: 'warn1', category: 'B', file_path: '', line_number: null },
    ];
    const report = buildReport('报告', {}, issues, false, 'category');
    expect(report).toContain('【A】');
    expect(report).toContain('【B】');
  });
});

describe('常量导出', () => {
  test('SEP 和 DASH 长度正确', () => {
    expect(SEP.length).toBe(60);
    expect(DASH.length).toBe(40);
  });

  test('ICONS 包含必要键', () => {
    expect(ICONS).toHaveProperty('error');
    expect(ICONS).toHaveProperty('warning');
    expect(ICONS).toHaveProperty('info');
  });
});
