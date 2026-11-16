import { WebFeatureFlag } from '../../configuration/schema/constants';
import { FLAG_OVERRIDES_STORAGE_KEY } from '../constants';
import { writeFlagOverrides } from '.';

describe('writeFlagOverrides', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('stores the overrides', () => {
    writeFlagOverrides({ overrides: { [WebFeatureFlag.ENABLE_CALENDAR]: true } });

    expect(window.localStorage.getItem(FLAG_OVERRIDES_STORAGE_KEY)).toBe(
      JSON.stringify({ ENABLE_CALENDAR: true }),
    );
  });

  it('removes the entry when there is nothing left to override', () => {
    window.localStorage.setItem(FLAG_OVERRIDES_STORAGE_KEY, '{"ENABLE_CALENDAR":true}');

    writeFlagOverrides({ overrides: {} });

    expect(window.localStorage.getItem(FLAG_OVERRIDES_STORAGE_KEY)).toBeNull();
  });
});
