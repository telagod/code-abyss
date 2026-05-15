// test/lifecycle-command-generation.test.js
const {
  CLAUDE_COMMAND_TARGET,
  GEMINI_COMMAND_TARGET,
  getSkillPath,
  buildCommandFrontmatter,
  buildClaudeCommandSpec,
  buildClaudeBody,
  normalizeGeneratedSkill,
  generateCommandContent,
  buildGeminiCommandSpec,
  escapeTomlMultiline,
  buildGeminiPromptBody,
  generateGeminiCommandContent,
} = require('../bin/lib/lifecycle/command-generation.js');

describe('bin/lib/lifecycle/command-generation', () => {
  describe('targets', () => {
    test('CLAUDE_COMMAND_TARGET points to ~/.claude/skills', () => {
      expect(CLAUDE_COMMAND_TARGET.skillRoot).toBe('~/.claude/skills');
      expect(CLAUDE_COMMAND_TARGET.dir).toBe('commands');
    });
    test('GEMINI_COMMAND_TARGET points to ~/.gemini/skills', () => {
      expect(GEMINI_COMMAND_TARGET.skillRoot).toBe('~/.gemini/skills');
    });
  });

  describe('getSkillPath', () => {
    test('empty relPath returns SKILL.md at root', () => {
      expect(getSkillPath('~/.claude/skills', '')).toBe('~/.claude/skills/SKILL.md');
    });
    test('normalizes path separators to /', () => {
      expect(getSkillPath('~/.claude/skills', 'tools/verify-quality'))
        .toBe('~/.claude/skills/tools/verify-quality/SKILL.md');
    });
  });

  describe('buildCommandFrontmatter', () => {
    test('emits required fields', () => {
      const lines = buildCommandFrontmatter({
        name: 'foo', description: 'do x', allowedTools: 'Read',
      });
      expect(lines).toEqual([
        '---', 'name: foo', 'description: "do x"', 'allowed-tools: Read', '---', '',
      ]);
    });
    test('escapes quotes in description', () => {
      const lines = buildCommandFrontmatter({
        name: 'foo', description: 'with "quotes"', allowedTools: 'Read',
      });
      expect(lines).toContain('description: "with \\"quotes\\""');
    });
    test('includes argument-hint when present', () => {
      const lines = buildCommandFrontmatter({
        name: 'foo', description: 'x', argumentHint: '<file>', allowedTools: 'Read',
      });
      expect(lines).toContain('argument-hint: "<file>"');
    });
    test('joins allowedTools array with comma', () => {
      const lines = buildCommandFrontmatter({
        name: 'foo', description: 'x', allowedTools: ['Read', 'Bash'],
      });
      expect(lines).toContain('allowed-tools: Read, Bash');
    });
    test('defaults allowedTools to Read', () => {
      const lines = buildCommandFrontmatter({
        name: 'foo', description: 'x',
      });
      expect(lines).toContain('allowed-tools: Read');
    });
  });

  describe('buildClaudeCommandSpec', () => {
    test('builds spec with scriptRunner using $ARGUMENTS', () => {
      const spec = buildClaudeCommandSpec({
        name: 'vq', description: 'd', relPath: 'tools/verify-quality',
      });
      expect(spec.scriptRunner).toContain('vq $ARGUMENTS');
      expect(spec.skillPath).toBe('~/.claude/skills/tools/verify-quality/SKILL.md');
    });
  });

  describe('buildClaudeBody', () => {
    test('scripted skill includes "一气呵成" instruction', () => {
      const body = buildClaudeBody({ runtimeType: 'scripted', skillPath: 'p', scriptRunner: 'r' });
      expect(body.join('\n')).toMatch(/一气呵成/);
      expect(body.join('\n')).toContain('r');
    });
    test('knowledge skill emits skill path reference only', () => {
      const body = buildClaudeBody({ runtimeType: 'knowledge', skillPath: 'p' });
      expect(body.join('\n')).toMatch(/读取以下技能文档/);
      expect(body.join('\n')).toContain('p');
    });
  });

  describe('normalizeGeneratedSkill', () => {
    test('fills missing defaults', () => {
      const out = normalizeGeneratedSkill({ name: 'x' }, 'rel/path', 'scripted');
      expect(out).toMatchObject({
        name: 'x', description: '', argumentHint: '', allowedTools: 'Read',
        relPath: 'rel/path', runtimeType: 'scripted',
      });
    });
  });

  describe('generateCommandContent', () => {
    test('produces complete markdown with frontmatter + body', () => {
      const content = generateCommandContent(
        { name: 'foo', description: 'd', allowedTools: 'Read' },
        'tools/foo',
        'knowledge'
      );
      expect(content).toMatch(/^---\n/);
      expect(content).toMatch(/name: foo/);
      expect(content).toMatch(/读取以下技能文档/);
    });
  });

  describe('buildGeminiCommandSpec', () => {
    test('builds spec pointing to gemini skills root', () => {
      const spec = buildGeminiCommandSpec({ name: 'vq', relPath: 'tools/verify-quality' });
      expect(spec.skillPath).toBe('~/.gemini/skills/tools/verify-quality/SKILL.md');
      expect(spec.scriptRunner).toContain('~/.gemini/skills/run_skill.js vq');
    });
  });

  describe('escapeTomlMultiline', () => {
    test('handles null/undefined', () => {
      expect(escapeTomlMultiline(null)).toBe('');
      expect(escapeTomlMultiline(undefined)).toBe('');
    });
    test('trims whitespace', () => {
      expect(escapeTomlMultiline('  hi  ')).toBe('hi');
    });
  });

  describe('buildGeminiPromptBody', () => {
    test('scripted skill instructs to run scriptRunner', () => {
      const body = buildGeminiPromptBody({
        runtimeType: 'scripted', skillPath: 'p', scriptRunner: 'r',
      });
      expect(body).toContain('r');
      expect(body).toMatch(/Do not stop/);
    });
    test('knowledge skill uses authoritative playbook wording', () => {
      const body = buildGeminiPromptBody({ runtimeType: 'knowledge', skillPath: 'p' });
      expect(body).toMatch(/authoritative playbook/);
    });
  });

  describe('generateGeminiCommandContent', () => {
    test('produces TOML with description + prompt', () => {
      const content = generateGeminiCommandContent(
        { name: 'foo', description: 'd', allowedTools: 'Read' },
        'tools/foo',
        'knowledge'
      );
      expect(content).toMatch(/^description = "d"/);
      expect(content).toMatch(/prompt = """/);
      expect(content).toMatch(/"""\n$/);
    });
    test('escapes quotes in description', () => {
      const content = generateGeminiCommandContent(
        { name: 'foo', description: 'with "quotes"', allowedTools: 'Read' },
        'tools/foo',
        'knowledge'
      );
      expect(content).toMatch(/description = "with \\"quotes\\""/);
    });
  });
});
