'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  listVendorProviderNames,
  getVendorProvider,
} = require('../bin/lib/vendor-providers');
const { validatePackManifest } = require('../bin/lib/pack-registry');

describe('vendor provider registry', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-provider-registry-'));
    const providerDir = path.join(tmpDir, '.code-abyss', 'vendor-providers');
    fs.mkdirSync(providerDir, { recursive: true });
    fs.writeFileSync(path.join(providerDir, 'custom.js'), `
module.exports = {
  name: 'custom-provider',
  validate() {},
  sync() { return { provider: 'custom-provider', action: 'updated', vendorDir: '/tmp/x', pack: 'x', version: '' }; },
  status() { return { provider: 'custom-provider', exists: false, dirty: false, drifted: false, pack: 'x', vendorDir: '/tmp/x', metadata: null }; },
};
`);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('listVendorProviderNames 合并内建与项目级 provider', () => {
    const providers = listVendorProviderNames(tmpDir);
    // 内建只剩 git（archive/local-dir 已在 v3 删除，无真实消费者）
    expect(providers).toEqual(expect.arrayContaining(['git', 'custom-provider']));
  });

  test('getVendorProvider 可读取项目级 provider', () => {
    const provider = getVendorProvider('custom-provider', tmpDir);
    expect(provider.name).toBe('custom-provider');
  });

  test('validatePackManifest 接受项目级 provider 名称', () => {
    expect(() => validatePackManifest({
      name: 'custom-pack',
      description: 'custom pack',
      upstream: {
        provider: 'custom-provider',
      },
      hosts: {
        claude: {
          uninstall: {
            runtimeRoot: { root: 'claude', path: 'skills/custom-pack' },
          },
        },
      },
    }, '/tmp/custom-pack.json', tmpDir)).not.toThrow();
  });
});
