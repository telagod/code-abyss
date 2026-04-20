'use strict';

const { walkFiles, readText, relativeTo, classifyPath } = require('./runtime');
const { summarizeIssueHotspots } = require('./quality-analysis');
const path = require('path');

const SECURITY_RULES = [
  {
    id: 'sql-injection-dynamic',
    severity: 'critical',
    category: 'injection',
    extensions: ['.py', '.js', '.ts', '.go', '.java'],
    pattern: /\b(execute|query|raw)\s*\(\s*(f["']|["'][^"'\n]*["']\s*\+|["'][^"'\n]*["']\s*%|["'][^"'\n]*["']\s*\.format\s*\()/i,
    message: 'possible dynamic SQL construction'
  },
  {
    id: 'command-shell-true',
    severity: 'critical',
    category: 'injection',
    extensions: ['.py'],
    pattern: /(subprocess\.(call|run|Popen)|os\.system|os\.popen)\s*\([^)]*shell\s*=\s*True/i,
    message: 'shell=True may allow command injection'
  },
  {
    id: 'dangerous-eval',
    severity: 'high',
    category: 'execution',
    extensions: ['.py', '.js', '.ts'],
    pattern: /(^|[^.\w])(eval|exec)\s*\(/i,
    message: 'eval-like execution detected'
  },
  {
    id: 'xss-innerhtml',
    severity: 'high',
    category: 'xss',
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.html'],
    pattern: /\.innerHTML\s*=|\.outerHTML\s*=|document\.write\s*\(/i,
    message: 'HTML sink write may allow XSS'
  },
  {
    id: 'dangerously-set-inner-html',
    severity: 'medium',
    category: 'xss',
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    pattern: /dangerouslySetInnerHTML/i,
    message: 'dangerouslySetInnerHTML requires strict sanitization'
  },
  {
    id: 'hardcoded-secret',
    severity: 'high',
    category: 'secret',
    extensions: ['.py', '.js', '.ts', '.go', '.java', '.json', '.yml', '.yaml', '.env'],
    pattern: /(?<!\w)(password|passwd|pwd|secret|api_key|apikey|token|auth_token)\s*[:=]\s*["'][^"']{8,}["']/i,
    excludePattern: /(example|placeholder|changeme|xxx|your[_-]|todo|fixme|<.*>|\*{3,})/i,
    message: 'possible hardcoded secret'
  },
  {
    id: 'aws-key',
    severity: 'critical',
    category: 'secret',
    extensions: ['*'],
    pattern: /AKIA[0-9A-Z]{16}/,
    message: 'AWS access key detected'
  },
  {
    id: 'private-key',
    severity: 'critical',
    category: 'secret',
    extensions: ['*'],
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
    message: 'private key material detected'
  },
  {
    id: 'weak-hash',
    severity: 'medium',
    category: 'crypto',
    extensions: ['.py', '.js', '.ts', '.go', '.java'],
    pattern: /\b(md5|sha1)\b/i,
    message: 'weak hash primitive marker detected'
  },
  {
    id: 'path-traversal',
    severity: 'high',
    category: 'path',
    extensions: ['.py', '.js', '.ts'],
    pattern: /(open|readFile|writeFile|sendFile|join)\s*\([^)]*(request|input|argv|args|params|query|pathParam|fileParam|userPath|userFile)/i,
    message: 'possible path traversal surface'
  },
  {
    id: 'ssrf',
    severity: 'high',
    category: 'network',
    extensions: ['.py', '.js', '.ts'],
    pattern: /(requests\.(get|post|put|delete)|fetch|axios\.(get|post|put|delete)|urlopen)\s*\([^)]*(request|input|argv|args|params|query|url)/i,
    message: 'possible SSRF surface'
  },
  {
    id: 'yaml-unsafe-load',
    severity: 'high',
    category: 'deserialization',
    extensions: ['.py'],
    pattern: /\byaml\.load\s*\(/i,
    excludePattern: /SafeLoader|CSafeLoader/i,
    message: 'yaml.load may deserialize unsafe input'
  },
  {
    id: 'pickle-deserialize',
    severity: 'critical',
    category: 'deserialization',
    extensions: ['.py'],
    pattern: /\b(pickle|dill|marshal)\.(load|loads)\s*\(/i,
    message: 'unsafe deserialization primitive detected'
  },
  {
    id: 'tls-verification-disabled',
    severity: 'high',
    category: 'network',
    extensions: ['.py', '.js', '.ts'],
    pattern: /\bverify\s*=\s*False\b|rejectUnauthorized\s*:\s*false/i,
    message: 'TLS verification appears disabled'
  },
  {
    id: 'permissive-cors',
    severity: 'medium',
    category: 'boundary',
    extensions: ['.js', '.ts', '.py', '.java', '.go'],
    pattern: /Access-Control-Allow-Origin[^\\n]*\*|origin\s*:\s*['"]\*['"]/i,
    message: 'permissive CORS policy marker detected'
  },
  {
    id: 'jwt-verify-disabled',
    severity: 'high',
    category: 'auth',
    extensions: ['.py', '.js', '.ts'],
    pattern: /verify_signature\s*:\s*False|ignoreExpiration\s*:\s*true|ignoreExpiration\s*=\s*True/i,
    message: 'token verification appears weakened or disabled'
  },
  {
    id: 'express-cors-open',
    severity: 'medium',
    category: 'boundary',
    extensions: ['.js', '.ts'],
    pattern: /\bcors\s*\(\s*\)/i,
    message: 'open CORS middleware configuration may be broader than intended'
  }
];

const SECURITY_FLOW_RULES = [
  {
    id: 'source-to-exec',
    severity: 'critical',
    category: 'execution',
    source: /\b(req|request)\.(body|query|params|headers)|\b(userInput|input|argv|process\.argv)\b/i,
    sink: /\b(exec|spawn|spawnSync|system|popen|subprocess\.(run|call|Popen))\b/i,
    message: 'untrusted input and command-execution primitives appear in the same file; review command-injection path'
  },
  {
    id: 'source-to-filesystem',
    severity: 'high',
    category: 'path',
    source: /\b(req|request)\.(body|query|params)|\b(userPath|userFile|pathParam|fileParam|input)\b/i,
    sink: /\b(readFile|writeFile|sendFile|open|fs\.)\b/i,
    message: 'untrusted path-like input and filesystem operations appear in the same file; review traversal and overwrite risk'
  },
  {
    id: 'source-to-remote-fetch',
    severity: 'high',
    category: 'network',
    source: /\b(req|request)\.(body|query|params)|\b(userUrl|url|targetUrl|input)\b/i,
    sink: /\b(fetch|axios\.(get|post|put|delete)|requests\.(get|post|put|delete)|urlopen)\b/i,
    message: 'untrusted URL-like input and outbound fetch logic appear in the same file; review SSRF boundaries'
  },
  {
    id: 'source-to-html-sink',
    severity: 'high',
    category: 'xss',
    source: /\b(req|request)\.(body|query|params)|\b(userHtml|userContent|content|html)\b/i,
    sink: /\.innerHTML\s*=|dangerouslySetInnerHTML|document\.write\s*\(/i,
    message: 'untrusted content and HTML sink logic appear in the same file; review XSS handling and sanitization'
  }
];

function extOf(file) {
  return path.extname(file).toLowerCase();
}

function isMeaningfulSecurityLine(line, pattern) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^(message:|re:|pattern:|const SECURITY_RULES\b|\{)/.test(trimmed)) return false;
  if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return false;
  if (pattern.excludePattern && pattern.excludePattern.test(line)) return false;
  return pattern.pattern.test(line);
}

function firstMatchingLine(lines, regex) {
  for (let index = 0; index < lines.length; index += 1) {
    if (regex.test(lines[index])) return index + 1;
  }
  return 0;
}

function analyzeSecurity(targetDir, options = {}) {
  const files = walkFiles(targetDir, options);
  const findings = [];

  for (const file of files) {
    const rel = relativeTo(targetDir, file);
    const ext = extOf(rel);
    if (classifyPath(rel) !== 'code' && classifyPath(rel) !== 'config') continue;
    const text = readText(file);
    if (!text) continue;

    const lines = text.split(/\r?\n/);
    for (const pattern of SECURITY_RULES) {
      if (!pattern.extensions.includes('*') && !pattern.extensions.includes(ext)) continue;
      const lineIndex = lines.findIndex(line => isMeaningfulSecurityLine(line, pattern));
      if (lineIndex >= 0) {
        findings.push({
          severity: pattern.severity,
          file: rel,
          line_number: lineIndex + 1,
          category: pattern.category,
          message: pattern.message
        });
      }
    }

    for (const flow of SECURITY_FLOW_RULES) {
      if (!flow.source.test(text) || !flow.sink.test(text)) continue;
      const line_number = firstMatchingLine(lines, flow.sink) || firstMatchingLine(lines, flow.source) || 1;
      findings.push({
        severity: flow.severity,
        file: rel,
        line_number,
        category: flow.category,
        message: flow.message
      });
    }
  }

  return {
    tool: 'verify-security',
    target: targetDir,
    summary: `Scanned ${files.length} files for rule-based security heuristics.`,
    findings,
    hotspots: summarizeIssueHotspots(findings),
    nextSteps: [
      'review high and critical findings first',
      'confirm whether each match is real or a benign test fixture',
      'follow with deeper source-to-sink review for risky paths'
    ]
  };
}

module.exports = {
  analyzeSecurity
};
