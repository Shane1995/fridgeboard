import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { configurationStore } from '../store';
import { setConfiguration } from './index';

afterEach(() => {
  setConfiguration(DEFAULT_WEB_CONFIGURATION);
});

describe('setConfiguration', () => {
  it('replaces the stored configuration', () => {
    const next = { ...DEFAULT_WEB_CONFIGURATION, params: { version: 'v9' } };

    setConfiguration(next);

    expect(configurationStore.current).toBe(next);
  });
});
