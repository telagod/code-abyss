'use strict';

const fs = require('fs');
const path = require('path');

describe('docs drift guard', () => {
  const projectRoot = path.join(__dirname, '..');

  test('README 不再写死过时 skill 数量与旧 Codex 入口', () => {
    const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8');

    expect(readme).not.toContain('56 篇');
    expect(readme).not.toContain('~/.codex/prompts');
  });

  test('CHANGELOG 对历史 skill 数量与旧 Codex 入口显式标注历史语境', () => {
    const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf8');

    expect(changelog).not.toContain('— 22 skills 通过\n');
    expect(changelog).toContain('历史口径');
    expect(changelog).toContain('当时的 Codex 安装流程');
  });

  test('DESIGN 不再宣称 Codex 运行时生成 AGENTS.md', () => {
    const design = fs.readFileSync(path.join(projectRoot, 'DESIGN.md'), 'utf8');

    expect(design).not.toContain('Codex 安装时会按所选 style 动态生成');
    expect(design).toContain('skills-only');
  });

  test('docs 路径口径不再把 root skills/ 当作权威来源', () => {
    const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8');
    const design = fs.readFileSync(path.join(projectRoot, 'DESIGN.md'), 'utf8');
    const onboarding = fs.readFileSync(path.join(projectRoot, 'docs', 'ONBOARDING.md'), 'utf8');
    const docsReadme = fs.readFileSync(path.join(projectRoot, 'docs', 'README.md'), 'utf8');
    const skillAuthoring = fs.readFileSync(path.join(projectRoot, 'docs', 'SKILL_AUTHORING.md'), 'utf8');
    const corpus = [readme, design, onboarding, docsReadme, skillAuthoring].join('\n');

    expect(corpus).not.toContain('`skills/**/SKILL.md`');
    expect(corpus).not.toContain('`skills/<category>/<name>/SKILL.md`');
    expect(corpus).not.toContain('`skills/<category>/<skill-name>/SKILL.md`');
    expect(corpus).toContain('`personal-skill-system/skills/**/SKILL.md`');
  });
});
