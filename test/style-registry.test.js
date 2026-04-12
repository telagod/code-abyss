'use strict';

const path = require('path');

const {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  renderCodexAgents,
  renderGeminiContext,
} = require('../bin/lib/style-registry');

describe('style registry', () => {
  const projectRoot = path.join(__dirname, '..');

  test('列出所有可用风格', () => {
    const styles = listStyles(projectRoot);
    expect(styles.map(style => style.slug)).toEqual(
      expect.arrayContaining(['abyss-cultivator', 'abyss-concise', 'abyss-command', 'abyss-ritual'])
    );
  });

  test('读取默认风格', () => {
    const style = getDefaultStyle(projectRoot, 'claude');
    expect(style.slug).toBe('abyss-cultivator');
  });

  test('按 slug 解析风格', () => {
    const style = resolveStyle(projectRoot, 'abyss-concise', 'codex');
    expect(style).toMatchObject({
      slug: 'abyss-concise',
      label: '冷刃简报',
    });
  });

  test('为 Codex 动态生成 AGENTS', () => {
    const content = renderCodexAgents(projectRoot, 'abyss-concise');
    expect(content).toContain('# 邪修红尘仙 · 宿命深渊 v4.1');
    expect(content).toContain('# 冷刃简报 · 输出之道');
  });

  test('为 Gemini 动态生成 GEMINI context', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-concise');
    expect(content).toContain('# 邪修红尘仙 · 宿命深渊 v4.1');
    expect(content).toContain('# 冷刃简报 · 输出之道');
  });

  test('默认 cultivator runtime guidance 保持轻量', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-cultivator');
    expect(content.length).toBeLessThan(2500);
    expect(content).toContain('# 宿命深渊 · 输出之道');
  });
});
