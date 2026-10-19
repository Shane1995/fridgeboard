import { DEFAULT_WEB_FLAGS, WEB_FEATURE_FLAGS, WebFeatureFlag } from './constants.ts';

describe('web feature flags', () => {
  it('lists every flag', () => {
    expect(WEB_FEATURE_FLAGS).toEqual(Object.keys(WebFeatureFlag));
  });

  it('defaults every flag to off', () => {
    expect(Object.values(DEFAULT_WEB_FLAGS).every((enabled) => !enabled)).toBe(true);
    expect(Object.keys(DEFAULT_WEB_FLAGS)).toEqual(WEB_FEATURE_FLAGS);
  });
});
