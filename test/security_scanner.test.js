'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { scanFile, SECURITY_RULES } = require(path.join(
  __dirname, '..', 'skills', 'analyzing-security', 'scripts', 'security_scanner.js'
));

describe('SECURITY_RULES', () => {
  test('非空数组', () => {
    expect(Array.isArray(SECURITY_RULES)).toBe(true);
    expect(SECURITY_RULES.length).toBeGreaterThan(0);
  });
  test('每条规则有必要字段', () => {
    for (const rule of SECURITY_RULES) {
      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('severity');
      expect(rule).toHaveProperty('pattern');
      expect(rule).toHaveProperty('extensions');
      expect(rule).toHaveProperty('message');
    }
  });
});

describe('scanFile', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sec-test-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  test('检出 SQL 注入', () => {
    const f = path.join(tmpDir, 'bad.py');
    fs.writeFileSync(f, 'cursor.execute(f"SELECT * FROM users WHERE id={uid}")');
    const findings = scanFile(f, SECURITY_RULES);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some(r => r.category === '注入')).toBe(true);
  });

  test('安全代码不误报', () => {
    const f = path.join(tmpDir, 'safe.py');
    fs.writeFileSync(f, 'x = 1 + 2\nprint(x)\n');
    const findings = scanFile(f, SECURITY_RULES);
    expect(findings.length).toBe(0);
  });

  test('检出硬编码 AWS Key', () => {
    const f = path.join(tmpDir, 'aws.js');
    fs.writeFileSync(f, 'const key = "AKIAIOSFODNN7EXAMPLE";\n');
    const findings = scanFile(f, SECURITY_RULES);
    expect(findings.some(r => r.message.includes('AWS'))).toBe(true);
  });

  test('不存在的文件返回空数组', () => {
    const findings = scanFile('/tmp/nonexistent_file_xyz.py', SECURITY_RULES);
    expect(findings).toEqual([]);
  });

  test('检出 innerHTML XSS', () => {
    const f = path.join(tmpDir, 'xss.js');
    fs.writeFileSync(f, 'el.innerHTML = userInput;');
    const findings = scanFile(f, SECURITY_RULES);
    expect(findings.some(r => r.category === 'XSS')).toBe(true);
  });
});
