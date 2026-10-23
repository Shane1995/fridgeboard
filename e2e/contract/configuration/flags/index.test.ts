import {
  WEB_FEATURE_FLAGS,
  WebFeatureFlag,
} from '../../../../packages/contract/src/configuration/flags/constants.ts';

describe('web feature flags', () => {
  it('lists every flag', () => {
    expect(WEB_FEATURE_FLAGS).toEqual(Object.keys(WebFeatureFlag));
  });
});
