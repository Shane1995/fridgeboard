import { WebService } from '../services/constants';
import { TEST_WEB_CONFIGURATION } from '../../../testUtils/webConfiguration';
import { resolveMutationEndpoint, resolveQueryEndpoint } from './index';

const withOverride = (timeoutMs: number) => ({
  ...TEST_WEB_CONFIGURATION,
  services: {
    api: {
      ...TEST_WEB_CONFIGURATION.services.api,
      endpointsConfig: { [WebService.me]: { timeoutMs } },
    },
  },
});

const namedConfig = {
  ...TEST_WEB_CONFIGURATION,
  queries: { ...TEST_WEB_CONFIGURATION.queries, me: { timeoutMs: 5_000 } },
  mutations: { ...TEST_WEB_CONFIGURATION.mutations, signOut: { timeoutMs: 4_000 } },
};

describe('resolveQueryEndpoint', () => {
  it('resolves the path with the default query timeout', () => {
    expect(resolveQueryEndpoint(TEST_WEB_CONFIGURATION, WebService.me)).toEqual({
      path: '/api/v1/me',
      timeoutMs: 10_000,
    });
  });

  it('prefers a named entry timeout over the default', () => {
    expect(resolveQueryEndpoint(namedConfig, WebService.me, 'me')).toEqual({
      path: '/api/v1/me',
      timeoutMs: 5_000,
    });
  });

  it('prefers a per-endpoint timeout over the named entry', () => {
    expect(
      resolveQueryEndpoint(
        { ...withOverride(2_000), queries: namedConfig.queries },
        WebService.me,
        'me',
      ).timeoutMs,
    ).toBe(2_000);
  });

  it('follows a served version bump', () => {
    const config = {
      ...TEST_WEB_CONFIGURATION,
      services: {
        api: { ...TEST_WEB_CONFIGURATION.services.api, params: { version: 'v2' } },
      },
    };

    expect(resolveQueryEndpoint(config, WebService.requestCode).path).toBe('/api/v2/auth/start');
  });
});

describe('resolveMutationEndpoint', () => {
  it('resolves the path with the default mutation timeout', () => {
    expect(resolveMutationEndpoint(TEST_WEB_CONFIGURATION, WebService.signOut)).toEqual({
      path: '/api/v1/auth/sign-out',
      timeoutMs: 10_000,
    });
  });

  it('prefers a named entry timeout, then a per-endpoint timeout', () => {
    expect(resolveMutationEndpoint(namedConfig, WebService.signOut, 'signOut').timeoutMs).toBe(
      4_000,
    );
    expect(
      resolveMutationEndpoint(
        {
          ...TEST_WEB_CONFIGURATION,
          services: {
            api: {
              ...TEST_WEB_CONFIGURATION.services.api,
              endpointsConfig: { [WebService.signOut]: { timeoutMs: 1_500 } },
            },
          },
        },
        WebService.signOut,
        'signOut',
      ).timeoutMs,
    ).toBe(1_500);
  });
});
