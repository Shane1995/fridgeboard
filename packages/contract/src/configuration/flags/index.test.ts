import { WEB_FEATURE_FLAGS, WebFeatureFlag } from './constants.ts';

describe('web feature flags', () => {
  it('lists every flag', () => {
    expect(WEB_FEATURE_FLAGS).toEqual(Object.keys(WebFeatureFlag));
  });
});
