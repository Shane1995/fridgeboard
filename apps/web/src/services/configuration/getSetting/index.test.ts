import { WEB_SETTING } from '@fridgeboard/contract/configuration/settings/constants';
import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { setConfiguration } from '../setConfiguration';
import { getSetting } from './index';

afterEach(() => {
  setConfiguration(DEFAULT_WEB_CONFIGURATION);
});

describe('getSetting', () => {
  it('returns the built-in defaults before any configuration loads', () => {
    expect(getSetting(WEB_SETTING.refreshLeadMs)).toBe(60_000);
    expect(getSetting(WEB_SETTING.refreshMinIntervalMs)).toBe(60_000);
  });

  it('returns the value from the last loaded configuration', () => {
    setConfiguration({
      ...DEFAULT_WEB_CONFIGURATION,
      settings: { refreshLeadMs: 5_000, refreshMinIntervalMs: 120_000 },
    });

    expect(getSetting(WEB_SETTING.refreshLeadMs)).toBe(5_000);
    expect(getSetting(WEB_SETTING.refreshMinIntervalMs)).toBe(120_000);
  });
});
