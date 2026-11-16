import { WebFeatureFlag } from '../../configuration/schema/constants';
import { TEST_WEB_CONFIGURATION } from '../../../testUtils/webConfiguration';
import { applyFlagOverrides } from '.';

const { featureFlags } = TEST_WEB_CONFIGURATION;

describe('applyFlagOverrides', () => {
  it('lets an override win over the served value in both directions', () => {
    const served = { ...featureFlags, [WebFeatureFlag.ENABLE_RECIPES]: true };

    const result = applyFlagOverrides({
      flags: served,
      overrides: {
        [WebFeatureFlag.ENABLE_RECIPES]: false,
        [WebFeatureFlag.ENABLE_CALENDAR]: true,
      },
    });

    expect(result[WebFeatureFlag.ENABLE_RECIPES]).toBe(false);
    expect(result[WebFeatureFlag.ENABLE_CALENDAR]).toBe(true);
  });

  it('leaves every other flag as served', () => {
    const result = applyFlagOverrides({
      flags: featureFlags,
      overrides: { [WebFeatureFlag.ENABLE_CALENDAR]: true },
    });

    expect(result).toEqual({ ...featureFlags, [WebFeatureFlag.ENABLE_CALENDAR]: true });
  });

  it('returns the served flags when there are no overrides', () => {
    expect(applyFlagOverrides({ flags: featureFlags, overrides: {} })).toEqual(featureFlags);
  });
});
