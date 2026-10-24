import { WebService } from '../schema/constants';
import { TEST_WEB_CONFIGURATION } from '../../../testUtils/webConfiguration';
import { resolveEndpoint } from './index';

const { api } = TEST_WEB_CONFIGURATION.services;

describe('resolveEndpoint', () => {
  it('reads the path from the configuration with the given timeout', () => {
    expect(resolveEndpoint(api, WebService.me, 10_000)).toEqual({
      path: '/api/v1/me',
      timeoutMs: 10_000,
    });
  });

  it('prefers a per-endpoint timeout', () => {
    const withOverride = { ...api, endpointsConfig: { [WebService.me]: { timeoutMs: 2_000 } } };

    expect(resolveEndpoint(withOverride, WebService.me, 10_000).timeoutMs).toBe(2_000);
    expect(resolveEndpoint(withOverride, WebService.verify, 10_000).timeoutMs).toBe(10_000);
  });
});
