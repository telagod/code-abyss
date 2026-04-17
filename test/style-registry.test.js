'use strict';

const path = require('path');

const {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  listPersonas,
  getDefaultPersona,
  resolvePersona,
  renderCodexAgents,
  renderGeminiContext,
} = require('../bin/lib/style-registry');

describe('style registry', () => {
  const projectRoot = path.join(__dirname, '..');

  test('列出所有可用风格', () => {
    const styles = listStyles(projectRoot);
    expect(styles.map(style => style.slug)).toEqual(
      expect.arrayContaining(['abyss-cultivator', 'scholar-classic', 'elder-sister-gentle', 'junior-sister-spark'])
    );
  });

  test('读取默认风格', () => {
    const style = getDefaultStyle(projectRoot, 'claude');
    expect(style.slug).toBe('abyss-cultivator');
  });

  test('按 slug 解析风格', () => {
    const style = resolveStyle(projectRoot, 'scholar-classic', 'claude');
    expect(style).toMatchObject({
      slug: 'scholar-classic',
      label: '墨渊书阁',
    });
  });

  test('为 Codex 动态生成 AGENTS', () => {
    const content = renderCodexAgents(projectRoot, 'abyss-cultivator', 'abyss');
    expect(content).toContain('# 邪修红尘仙 · 宿命深渊 v4.2');
    expect(content).toContain('# 宿命深渊 · 输出之道');
  });

  test('为 Gemini 动态生成 GEMINI context', () => {
    const content = renderGeminiContext(projectRoot, 'scholar-classic', 'scholar');
    expect(content).toContain('# 文言小生 · 墨渊书阁 v2.0');
    expect(content).toContain('# 墨渊书阁 · 输出之道');
  });

  test('心口分离：任意人格 × 任意风格自由组合', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-cultivator', 'elder-sister');
    expect(content).toContain('# 知性大姐姐 · 星霜雅筑 v2.0');
    expect(content).toContain('# 宿命深渊 · 输出之道');
  });

  test('所有 runtime guidance 保持在预算内', () => {
    const styles = listStyles(projectRoot);
    styles.forEach(style => {
      const content = renderGeminiContext(projectRoot, style.slug);
      expect(content.length).toBeLessThan(3000);
    });
  });
});

describe('persona registry', () => {
  const projectRoot = path.join(__dirname, '..');

  test('列出所有人格预设', () => {
    const personas = listPersonas(projectRoot);
    expect(personas.map(p => p.slug)).toEqual(
      expect.arrayContaining(['abyss', 'scholar', 'elder-sister', 'junior-sister'])
    );
  });

  test('读取默认人格', () => {
    const persona = getDefaultPersona(projectRoot);
    expect(persona.slug).toBe('abyss');
  });

  test('按 slug 解析人格', () => {
    const persona = resolvePersona(projectRoot, 'junior-sister');
    expect(persona).toMatchObject({
      slug: 'junior-sister',
      label: '古怪精灵小师妹',
    });
  });
});