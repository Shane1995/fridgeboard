import { mergeSettings } from '../../../../../packages/contract/src/configuration/settings/mergeSettings/index.ts';

describe('mergeSettings', () => {
  const defaults = { a: 1, b: 2 };

  it('overrides defaults with served values', () => {
    expect(mergeSettings(defaults, { a: 10 })).toEqual({ a: 10, b: 2 });
  });

  it('ignores undefined served values', () => {
    expect(mergeSettings(defaults, { a: undefined })).toEqual(defaults);
  });

  it('returns the defaults when nothing is served', () => {
    expect(mergeSettings(defaults, undefined)).toEqual(defaults);
  });
});
