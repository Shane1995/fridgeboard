import { findSecrets } from './index.ts';

describe('findSecrets', () => {
  it('returns nothing for a clean document', () => {
    expect(findSecrets({ version: 1, featureFlags: { A: true }, list: ['x'], n: null })).toEqual(
      [],
    );
  });

  it.each(['secret', 'apiToken', 'Password'])('flags the key %s', (key) => {
    expect(findSecrets({ nested: { [key]: 'x' } })).toEqual([
      `$.nested.${key}: key name suggests a secret`,
    ]);
  });

  it('flags an AWS access key id in a value', () => {
    expect(findSecrets({ a: 'AKIAABCDEFGHIJKLMNOP' })).toEqual([
      '$.a: value looks like a credential',
    ]);
  });

  it('flags a private key header inside an array', () => {
    expect(findSecrets({ a: ['-----BEGIN PRIVATE KEY-----'] })).toEqual([
      '$.a[0]: value looks like a credential',
    ]);
  });
});
