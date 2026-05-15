'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  syncPackVendor,
  getPackVendorStatus,
} = require('../bin/lib/pack-vendor');
const { validatePackManifest } = require('../bin/lib/pack-registry');

describe('pack vendor providers', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-pack-vendor-'));
    fs.mkdirSync(path.join(tmpDir, 'packs'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeManifest(name, upstream) {
    const dir = path.join(tmpDir, 'packs', name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({
      name,
      description: `${name} pack`,
      upstream,
      hosts: {
        claude: {
          uninstall: {
            runtimeRoot: { root: 'claude', path: `skills/${name}` },
          },
        },
      },
    }, null, 2));
  }

  test('validatePackManifest 拒绝未知 provider', () => {
    expect(() => validatePackManifest({
      name: 'bad',
      description: 'bad',
      upstream: { provider: 'unknown-provider' },
      hosts: { claude: { uninstall: { runtimeRoot: { root: 'claude', path: 'skills/bad' } } } },
    }, '/tmp/bad.json')).toThrow(/upstream\.provider 非法/);
  });

  test('syncPackVendor 支持自定义 provider（项目级注入）', () => {
    // archive/local-dir 内建 provider 在 v3 已删；动态加载机制保留，可注入项目级 provider
    const providerDir = path.join(tmpDir, '.code-abyss', 'vendor-providers');
    fs.mkdirSync(providerDir, { recursive: true });
    fs.writeFileSync(path.join(providerDir, 'fixture.js'), `
'use strict';
const fs = require('fs');
const path = require('path');
module.exports = {
  name: 'fixture',
  validate(upstream) {
    if (!upstream.path) throw new Error('upstream.provider=fixture 需要 path');
  },
  sync({ projectRoot, upstream, vendorDir, shared, packName }) {
    const sourcePath = shared.resolveUpstreamPath(projectRoot, upstream.path);
    shared.rmSafe(vendorDir);
    shared.copyRecursive(sourcePath, vendorDir);
    shared.writeVendorMetadata(vendorDir, {
      pack: packName, provider: 'fixture', path: upstream.path,
      sourceSignature: shared.hashDirectory(sourcePath),
      vendorSignature: shared.hashDirectory(vendorDir),
    });
    return { pack: packName, provider: 'fixture', action: 'updated', vendorDir, version: '' };
  },
  status({ projectRoot, upstream, vendorDir, shared, packName, metadata }) {
    return {
      pack: packName, provider: 'fixture', vendorDir,
      exists: true, dirty: false, drifted: false,
      currentCommit: null, targetCommit: null,
      sourceExists: true, metadata,
    };
  },
};
`);

    const sourceDir = path.join(tmpDir, 'fixture-source');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'README.md'), 'fixture source\n');
    writeManifest('fixture-pack', { provider: 'fixture', path: 'fixture-source' });

    const report = syncPackVendor(tmpDir, 'fixture-pack');
    const status = getPackVendorStatus(tmpDir, 'fixture-pack');

    expect(report.provider).toBe('fixture');
    expect(fs.existsSync(path.join(tmpDir, '.code-abyss', 'vendor', 'fixture-pack', 'README.md'))).toBe(true);
    expect(status).toMatchObject({ exists: true, provider: 'fixture' });
  });
});
