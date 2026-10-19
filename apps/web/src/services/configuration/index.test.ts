import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { WEB_SERVICE } from '@fridgeboard/contract/configuration/services/constants';
import { queryClient } from '../queryClient';
import { getConfiguration, getServicePath } from './index';

const respond = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  vi.restoreAllMocks();
  queryClient.clear();
});

describe('getConfiguration', () => {
  it('fetches /configuration.json', async () => {
    const spy = respond(DEFAULT_WEB_CONFIGURATION);

    await getConfiguration();

    expect(spy).toHaveBeenCalledWith('/configuration.json', {
      signal: expect.any(AbortSignal),
    });
  });

  it('merges served flags over the defaults', async () => {
    respond({ version: 1, featureFlags: { ENABLE_ADMIN_INVITES: true }, services: {} });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      featureFlags: { ENABLE_ADMIN_INVITES: true },
    });
  });

  it('fills missing flags from the defaults', async () => {
    respond({ version: 1, featureFlags: {}, services: {} });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('merges served params and services over the defaults', async () => {
    respond({
      version: 1,
      featureFlags: {},
      params: { version: 'v2' },
      services: { me: { url: '/api/{version}/profile' } },
    });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      params: { version: 'v2' },
      services: { ...DEFAULT_WEB_CONFIGURATION.services, me: { url: '/api/{version}/profile' } },
    });
  });

  it('ignores service names the app does not know', async () => {
    respond({ version: 1, featureFlags: {}, services: { removed: { url: '/api/x' } } });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('rejects a service url outside /api/', async () => {
    respond({ version: 1, featureFlags: {}, services: { me: { url: '/other' } } });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('ignores flag names the app does not know', async () => {
    respond({ version: 1, featureFlags: { REMOVED_FLAG: true }, services: {} });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('falls back to defaults on a non-ok response', async () => {
    respond({}, 500);

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('falls back to defaults on an invalid document', async () => {
    respond({ version: 2 });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('falls back to defaults when the request throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });
});

describe('getServicePath', () => {
  it('resolves the default path when the configuration is the defaults', async () => {
    respond(DEFAULT_WEB_CONFIGURATION);

    await expect(getServicePath(WEB_SERVICE.signOut)).resolves.toBe('/api/v1/auth/sign-out');
  });

  it('follows a served version bump', async () => {
    respond({ version: 1, featureFlags: {}, params: { version: 'v2' }, services: {} });

    await expect(getServicePath(WEB_SERVICE.me)).resolves.toBe('/api/v2/me');
  });

  it('reuses the cached configuration', async () => {
    const spy = respond(DEFAULT_WEB_CONFIGURATION);

    await getServicePath(WEB_SERVICE.me);
    await getServicePath(WEB_SERVICE.start);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('falls back to the default path when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    await expect(getServicePath(WEB_SERVICE.verify)).resolves.toBe('/api/v1/auth/verify');
  });

  it('falls back to the default path when a served url has an unresolved placeholder', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: { refresh: { url: '/api/{missing}/auth/refresh' } },
    });

    await expect(getServicePath(WEB_SERVICE.refresh)).resolves.toBe('/api/v1/auth/refresh');
  });
});
