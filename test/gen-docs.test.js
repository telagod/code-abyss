'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateDocs } = require('../skills/tools/gen-docs/scripts/doc_generator.js');

// 集成测试：通过实际运行验证功能
describe('gen-docs gitignore 支持', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-docs-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function runGenDocs(targetPath, args = []) {
    const force = args.includes('--force') || args.includes('-f');
    return Promise.resolve(generateDocs(targetPath, force));
  }

  test('排除 node_modules 目录', async () => {
    // 创建测试结构
    fs.mkdirSync(path.join(tempDir, 'node_modules'));
    fs.mkdirSync(path.join(tempDir, 'src'));
    fs.writeFileSync(path.join(tempDir, 'src/main.js'), 'console.log("test");');
    fs.writeFileSync(path.join(tempDir, 'node_modules/package.json'), '{}');

    const result = await runGenDocs(tempDir, ['--force']);

    expect(result.status).toBe('success');

    const readme = fs.readFileSync(path.join(tempDir, 'README.md'), 'utf8');
    expect(readme).toContain('src/main.js');
    expect(readme).not.toContain('node_modules');
  });

  test('支持 .gitignore 规则排除代码目录', async () => {
    // 创建 .gitignore
    fs.writeFileSync(path.join(tempDir, '.gitignore'), 'dist/\n.cache/');

    // 创建测试文件 - 用 .js 文件确保进入目录结构
    fs.mkdirSync(path.join(tempDir, 'src'));
    fs.mkdirSync(path.join(tempDir, 'dist'));
    fs.mkdirSync(path.join(tempDir, '.cache'));
    fs.writeFileSync(path.join(tempDir, 'src/main.js'), 'export default {}');
    fs.writeFileSync(path.join(tempDir, 'dist/bundle.js'), 'built');
    fs.writeFileSync(path.join(tempDir, '.cache/cache.js'), 'cached');

    const result = await runGenDocs(tempDir, ['--force']);

    expect(result.status).toBe('success');

    const readme = fs.readFileSync(path.join(tempDir, 'README.md'), 'utf8');
    expect(readme).toContain('src/main.js');       // 正常文件应出现
    expect(readme).not.toContain('dist/bundle.js'); // 被 gitignore 排除
    expect(readme).not.toContain('.cache/cache.js');// 被 gitignore 排除
  });
});