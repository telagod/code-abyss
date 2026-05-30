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
  applyPersonaVars,
  loadSharedBehavior,
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
    expect(content).toContain('# 邪修红尘仙 · 宿命深渊 v5.0');
    expect(content).toContain('# 宿命深渊 · 输出之道');
  });

  test('为 Gemini 动态生成 GEMINI context', () => {
    const content = renderGeminiContext(projectRoot, 'scholar-classic', 'scholar');
    expect(content).toContain('# 文言小生 · 墨渊书阁 v3.0');
    expect(content).toContain('# 墨渊书阁 · 输出之道');
  });

  test('心口分离：任意人格 × 任意风格自由组合', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-cultivator', 'elder-sister');
    expect(content).toContain('# 知性大姐姐 · 星霜雅筑 v3.0');
    expect(content).toContain('# 宿命深渊 · 输出之道');
  });

  test('模板变量替换：elder-sister × abyss-cultivator 应包含姐姐称谓', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-cultivator', 'elder-sister');
    expect(content).toContain('自称「姐姐」');
    expect(content).toContain('称用户「小宝」');
    expect(content).not.toContain('{{self}}');
    expect(content).not.toContain('{{user}}');
  });

  test('共享行为层加载：所有组合都包含铁律和技能路由', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-cultivator', 'abyss');
    expect(content).toContain('## 铁律');
    expect(content).toContain('## 技能路由');
    expect(content).toContain('## 主动协助协议');
    expect(content).toContain('## 执行链');
  });

  test('loadSharedBehavior 返回非空内容', () => {
    const shared = loadSharedBehavior(projectRoot);
    expect(shared.length).toBeGreaterThan(100);
    expect(shared).toContain('不妄语');
  });

  test('applyPersonaVars 正确替换', () => {
    const result = applyPersonaVars('Hello {{self}}, greet {{user}}', {
      self: 'me', user: 'you', language: 'en'
    });
    expect(result).toBe('Hello me, greet you');
  });

  test('全量跨配 smoke：所有 persona×style 组合无 crash 且无残留模板变量', () => {
    const personas = listPersonas(projectRoot);
    const styles = listStyles(projectRoot);
    expect(personas.length).toBeGreaterThanOrEqual(5);
    expect(styles.length).toBeGreaterThanOrEqual(5);

    for (const persona of personas) {
      for (const style of styles) {
        const content = renderGeminiContext(projectRoot, style.slug, persona.slug);
        expect(content.length).toBeGreaterThan(500);
        expect(content).not.toContain('{{self}}');
        expect(content).not.toContain('{{user}}');
        expect(content).not.toContain('{{language}}');
        expect(content).toContain(`自称「${persona.self}」`);
        expect(content).toContain(`称用户「${persona.user}」`);
      }
    }
  });

  test('所有 runtime guidance 保持在预算内', () => {
    const styles = listStyles(projectRoot);
    styles.forEach(style => {
      const content = renderGeminiContext(projectRoot, style.slug);
      // v2 五层架构新增 L2 范例 / L4 强指令层后，组装体上限对齐
      // tech-persona-card spec §6.3「Total assembled prompt recommended max 8,000」。
      expect(content.length).toBeLessThan(8000);
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

  test('persona index.json 每个条目都有 self/user/language 字段', () => {
    const personas = listPersonas(projectRoot);
    for (const persona of personas) {
      expect(persona.self).toBeTruthy();
      expect(persona.user).toBeTruthy();
      expect(persona.language).toBeTruthy();
    }
  });
});