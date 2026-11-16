import { WebFeatureFlag } from '../../configuration/schema/constants';
import { FLAG_OVERRIDES_STORAGE_KEY } from '../constants';
import { readFlagOverrides } from '.';

describe('readFlagOverrides', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('is empty when nothing is stored', () => {
    expect(readFlagOverrides()).toEqual({});
  });

  it('returns the stored overrides', () => {
    window.localStorage.setItem(
      FLAG_OVERRIDES_STORAGE_KEY,
      JSON.stringify({ ENABLE_CALENDAR: false, ENABLE_RECIPES: true }),
    );

    expect(readFlagOverrides()).toEqual({
      [WebFeatureFlag.ENABLE_CALENDAR]: false,
      [WebFeatureFlag.ENABLE_RECIPES]: true,
    });
  });

  it('drops unknown flags and values that are not booleans', () => {
    window.localStorage.setItem(
      FLAG_OVERRIDES_STORAGE_KEY,
      JSON.stringify({ ENABLE_CALENDAR: 'yes', NOT_A_FLAG: true, ENABLE_RECIPES: false }),
    );

    expect(readFlagOverrides()).toEqual({ [WebFeatureFlag.ENABLE_RECIPES]: false });
  });

  it.each(['not json', '[]', '"text"', 'null', '3'])('ignores the stored value %j', (stored) => {
    window.localStorage.setItem(FLAG_OVERRIDES_STORAGE_KEY, stored);

    expect(readFlagOverrides()).toEqual({});
  });
});
