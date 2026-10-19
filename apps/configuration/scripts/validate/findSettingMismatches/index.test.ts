import { findSettingMismatches } from './index.ts';

const settings = (usernameMaxLength: number) => ({
  settings: { usernameMinLength: 3, usernameMaxLength },
});

describe('findSettingMismatches', () => {
  it('reports nothing when shared settings agree', () => {
    expect(findSettingMismatches(settings(20), settings(20))).toEqual([]);
  });

  it('names a shared setting that differs between web and lambda', () => {
    expect(findSettingMismatches(settings(20), settings(24))).toEqual([
      'settings.usernameMaxLength differs: web=20 lambda=24',
    ]);
  });

  it('treats a missing setting on one side as a mismatch', () => {
    expect(findSettingMismatches({ settings: { usernameMinLength: 3 } }, {})).toContain(
      'settings.usernameMinLength differs: web=3 lambda=undefined',
    );
  });

  it.each([null, 'text', 7])('ignores a malformed file: %j', (file) => {
    expect(findSettingMismatches(file, file)).toEqual([]);
  });
});
