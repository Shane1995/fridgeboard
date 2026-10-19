import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { toSessionConfig } from '.';

describe('toSessionConfig', () => {
  it('maps the refresh path and timing settings', () => {
    expect(toSessionConfig(DEFAULT_WEB_CONFIGURATION)).toEqual({
      refreshPath: '/api/v1/auth/refresh',
      refreshLeadMs: 60_000,
      refreshMinIntervalMs: 60_000,
    });
  });

  it('uses configured settings and a served refresh url', () => {
    const configuration = {
      ...DEFAULT_WEB_CONFIGURATION,
      services: {
        ...DEFAULT_WEB_CONFIGURATION.services,
        refresh: { url: '/api/v2/auth/refresh' },
      },
      settings: { refreshLeadMs: 300_000, refreshMinIntervalMs: 120_000 },
    };

    expect(toSessionConfig(configuration)).toEqual({
      refreshPath: '/api/v2/auth/refresh',
      refreshLeadMs: 300_000,
      refreshMinIntervalMs: 120_000,
    });
  });
});
