'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  listPersonas,
  getDefaultPersona,
  resolvePersona,
  renderCodexAgents,
  renderGeminiContext,
  renderRuntimeGuidance,
  loadRenderablePersona,
  applyPersonaVars,
  loadSharedBehavior,
} = require('../bin/lib/style-registry');

const { validatePersonaVoiceCard, renderPersonaIdentity, NEUTRAL_FALLBACK_PERSONA } = require('../bin/lib/persona-voice-card');

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

  test('为 Codex 动态生成 AGENTS：人格层是固定模板，不含自由文本', () => {
    const content = renderCodexAgents(projectRoot, 'abyss-cultivator', 'abyss');
    expect(content).toContain('## 人格');
    expect(content).toContain('自称：吾');
    expect(content).toContain('称呼你：魔尊');
    expect(content).toContain('# 宿命深渊 · 输出之道');
  });

  test('为 Gemini 动态生成 GEMINI context', () => {
    const content = renderGeminiContext(projectRoot, 'scholar-classic', 'scholar');
    expect(content).toContain('自称：在下');
    expect(content).toContain('称呼你：前辈');
    expect(content).toContain('# 墨渊书阁 · 输出之道');
  });

  test('心口分离：任意人格 × 任意风格自由组合', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-cultivator', 'elder-sister');
    expect(content).toContain('自称：姐姐');
    expect(content).toContain('称呼你：小宝');
    expect(content).toContain('# 宿命深渊 · 输出之道');
  });

  test('模板变量替换：elder-sister × abyss-cultivator 风格层应包含姐姐称谓', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-cultivator', 'elder-sister');
    expect(content).toContain('自称「姐姐」');
    expect(content).toContain('称用户「小宝」');
    expect(content).not.toContain('{{self}}');
    expect(content).not.toContain('{{user}}');
  });

  test('共享行为层加载：所有组合都包含铁律和技能路由', () => {
    const content = renderGeminiContext(projectRoot, 'abyss-cultivator', 'abyss');
    // v3 always-on core (persona-architecture-v3.md §2): safety/precedence +
    // thin router + kernel anchor. The behavior/method content (proactive,
    // execution-chains) moved to the lazy-loaded kernel bundles and is no
    // longer baked into every render.
    expect(content).toContain('## 铁律');
    expect(content).toContain('## 技能路由');
    expect(content).toContain('## 纪律内核');   // kernel router
    expect(content).toContain('## 内核边界');   // precedence anchor (always last)
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
      const voiceCard = loadRenderablePersona(projectRoot, persona);
      for (const style of styles) {
        const content = renderGeminiContext(projectRoot, style.slug, persona.slug);
        expect(content.length).toBeGreaterThan(300);
        expect(content).not.toContain('{{self}}');
        expect(content).not.toContain('{{user}}');
        expect(content).not.toContain('{{language}}');
        expect(content).toContain(`自称「${voiceCard.self}」`);
        expect(content).toContain(`称用户「${voiceCard.user}」`);
      }
    }
  });

  test('所有 runtime guidance 保持在预算内', () => {
    const styles = listStyles(projectRoot);
    styles.forEach(style => {
      const content = renderGeminiContext(projectRoot, style.slug);
      // Total assembled prompt recommended max 8,000 (docs/specs). The
      // identity layer shrank drastically in the persona redesign (fixed
      // template vs. freeform .md + optional L2/L4 layers), so this budget
      // now has considerably more headroom than the v3 kernel-merge era.
      expect(content.length).toBeLessThan(8000);
    });
  });

  test('L0 共享层必须 persona-中立：无模板变量、无任何 persona 人称', () => {
    const sharedDir = path.join(projectRoot, 'config', 'personas', '_shared');
    const personas = listPersonas(projectRoot);
    const tokens = [...new Set(personas.flatMap(p => {
      const voiceCard = loadRenderablePersona(projectRoot, p);
      return [voiceCard.self, voiceCard.user];
    }))];
    const violations = [];
    for (const file of fs.readdirSync(sharedDir)) {
      if (!file.endsWith('.md')) continue;
      const content = fs.readFileSync(path.join(sharedDir, file), 'utf8');
      if (content.includes('{{')) violations.push(`${file}: 含未替换模板变量 {{（L0 不过宏替换，会原样泄漏）`);
      for (const t of tokens) {
        if (content.includes(t)) violations.push(`${file}: 含 persona 人称「${t}」（L0 须保持中立）`);
      }
    }
    expect(violations).toEqual([]);
  });

  test('renderPersonaIdentity 是固定白名单模板：源码中不存在 {{body}}/{{content}} 兜底通配符', () => {
    // A future edit that tried to reopen a freeform prose channel would have
    // to add a catch-all slot to this function — this assertion is the
    // "unit test asserting this literally" the persona redesign's enforcement
    // layer 3 calls for.
    const src = renderPersonaIdentity.toString();
    expect(src).not.toContain('{{body}}');
    expect(src).not.toContain('{{content}}');
  });

  test('人格文件校验失败时渲染回退到中性语音，绝不渲染未校验内容（不 crash）', () => {
    const scratchRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'code-abyss-persona-fallback-'));
    fs.mkdirSync(path.join(scratchRoot, 'config', 'personas'), { recursive: true });
    fs.writeFileSync(
      path.join(scratchRoot, 'config', 'personas', 'broken-test.json'),
      JSON.stringify({ spec: 'persona-voice-card', spec_version: '1.0', slug: 'broken-test', self: '', user: 'x', register: 'not-a-real-register' })
    );

    const voiceCard = loadRenderablePersona(scratchRoot, { slug: 'broken-test', core: true });
    expect(voiceCard.self).toBe(NEUTRAL_FALLBACK_PERSONA.self);
    expect(voiceCard.user).toBe(NEUTRAL_FALLBACK_PERSONA.user);
    expect(voiceCard.slug).toBe('broken-test'); // slug identity preserved even on fallback

    fs.rmSync(scratchRoot, { recursive: true, force: true });
  });
});

describe('persona-voice-card validator', () => {
  const BASE = {
    spec: 'persona-voice-card',
    spec_version: '1.0',
    slug: 'test-persona',
    label: '测试人格',
    self: '我',
    user: '你',
    language: '中文',
    register: 'casual',
    emoji_policy: 'minimal',
  };

  test('合法卡片通过校验', () => {
    const { valid, errors } = validatePersonaVoiceCard(BASE);
    expect(valid).toBe(true);
    expect(errors).toEqual([]);
  });

  test('未知字段一律拒绝（additionalProperties:false）', () => {
    const { valid, errors } = validatePersonaVoiceCard({ ...BASE, authorization: { tiers: [] } });
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('authorization'))).toBe(true);
  });

  test('scenarios/capabilities/identity 等旧字段一律拒绝', () => {
    ['scenarios', 'capabilities', 'identity', 'behavior', 'style', 'extensions'].forEach((field) => {
      const { valid, errors } = validatePersonaVoiceCard({ ...BASE, [field]: {} });
      expect(valid).toBe(false);
      expect(errors.some(e => e.includes(field))).toBe(true);
    });
  });

  test('self/user 超过 16 字符拒绝', () => {
    const { valid } = validatePersonaVoiceCard({ ...BASE, self: 'x'.repeat(17) });
    expect(valid).toBe(false);
  });

  test('self/user 含禁用字符（换行/>/|/#/→）拒绝', () => {
    ['a\nb', 'a>b', 'a|b', 'a#b', 'a→b'].forEach((bad) => {
      const { valid } = validatePersonaVoiceCard({ ...BASE, self: bad });
      expect(valid).toBe(false);
    });
  });

  test('register/emoji_policy 必须是枚举值', () => {
    expect(validatePersonaVoiceCard({ ...BASE, register: 'sarcastic' }).valid).toBe(false);
    expect(validatePersonaVoiceCard({ ...BASE, emoji_policy: 'heavy' }).valid).toBe(false);
  });

  test('flourish 最多 2 项，每项 ≤32 字符', () => {
    expect(validatePersonaVoiceCard({ ...BASE, flourish: ['a', 'b', 'c'] }).valid).toBe(false);
    expect(validatePersonaVoiceCard({ ...BASE, flourish: ['x'.repeat(33)] }).valid).toBe(false);
    expect(validatePersonaVoiceCard({ ...BASE, flourish: ['ok', 'fine'] }).valid).toBe(true);
  });

  test('self+user+flourish 总长超过 60 字符预算拒绝（防止拆分数组绕过单字段上限）', () => {
    // Each individually within the 16/32-char per-field caps, but together
    // they blow the 60-char aggregate budget — this is exactly the
    // "reconstruct a table across compliant array items" loophole the
    // enforceability review flagged. The budget sits below what the
    // per-field caps alone would allow (16+16+64=96), so it is a real,
    // binding constraint, not a decorative one.
    const flourish = ['x'.repeat(32)];
    const { valid, errors } = validatePersonaVoiceCard({ ...BASE, self: 'y'.repeat(16), user: 'z'.repeat(16), flourish });
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('预算'))).toBe(true);
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
      label: '古怪精灵小师妹 · 灵犀洞天',
    });
  });

  test('每个人格实际语音卡都能通过 loadRenderablePersona 取得非空 self/user/language', () => {
    const personas = listPersonas(projectRoot);
    for (const persona of personas) {
      const voiceCard = loadRenderablePersona(projectRoot, persona);
      expect(voiceCard.self).toBeTruthy();
      expect(voiceCard.user).toBeTruthy();
      expect(voiceCard.language).toBeTruthy();
    }
  });

  test('单一事实源：core persona 的 index.json 条目不含 label/description（派生自实际 voice card）', () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'config', 'personas', 'index.json'), 'utf8')
    );
    for (const entry of raw.personas) {
      if (entry.core === false) continue;
      ['label', 'description'].forEach((field) => {
        expect(entry[field]).toBeUndefined();
      });
    }
  });

  test('非核心 persona 的 index.json 条目只含离线 picker 所需的 label/description（不重复 self/user/language）', () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'config', 'personas', 'index.json'), 'utf8')
    );
    for (const entry of raw.personas) {
      if (entry.core !== false) continue;
      expect(entry.label).toBeTruthy();
      // self/user/language are deliberately NOT duplicated in index.json —
      // they are read fresh from the actual (fetched+cached) voice card at
      // render time, so there is exactly one place this data can drift from.
      ['self', 'user', 'language', 'register', 'emoji_policy'].forEach((field) => {
        expect(entry[field]).toBeUndefined();
      });
    }
  });

  test('核心 persona 派生 label 与对应 voice card 严格一致', () => {
    const personas = listPersonas(projectRoot).filter(p => p.core !== false);
    for (const p of personas) {
      const card = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'config', 'personas', `${p.slug}.json`), 'utf8')
      );
      expect(p.label).toBe(card.label);
    }
  });

  test('测量闸：每个 persona×style 渲染都携带内核优先级锚与 forbidden-zone', () => {
    const personas = listPersonas(projectRoot);
    const styles = listStyles(projectRoot);
    for (const p of personas) {
      for (const s of styles) {
        const content = renderGeminiContext(projectRoot, s.slug, p.slug);
        expect(content).toContain('## 内核边界');      // precedence anchor (always last)
        expect(content).toContain('forbidden zone');   // iron-laws boundary
      }
    }
  });

  test('所有委托 config/personas/*.json 都通过 persona-voice-card 校验', () => {
    const personasDir = path.join(projectRoot, 'config', 'personas');
    const files = fs.readdirSync(personasDir).filter(f => f.endsWith('.json') && f !== 'index.json');
    expect(files.length).toBeGreaterThanOrEqual(5);
    for (const file of files) {
      const card = JSON.parse(fs.readFileSync(path.join(personasDir, file), 'utf8'));
      const { valid, errors } = validatePersonaVoiceCard(card);
      expect(errors).toEqual([]);
      expect(valid).toBe(true);
    }
  });
});
