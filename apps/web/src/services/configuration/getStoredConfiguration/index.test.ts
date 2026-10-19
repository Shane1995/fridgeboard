import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { setConfiguration } from '../setConfiguration';
import { getStoredConfiguration } from './index';

afterEach(() => {
  setConfiguration(DEFAULT_WEB_CONFIGURATION);
});

describe('getStoredConfiguration', () => {
  it('returns the defaults until a configuration is stored', () => {
    expect(getStoredConfiguration()).toBe(DEFAULT_WEB_CONFIGURATION);
  });

  it('returns the stored configuration', () => {
    const next = { ...DEFAULT_WEB_CONFIGURATION, featureFlags: { ENABLE_ADMIN_INVITES: true } };

    setConfiguration(next);

    expect(getStoredConfiguration()).toBe(next);
  });
});
