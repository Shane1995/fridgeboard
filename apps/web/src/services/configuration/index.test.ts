import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { CONFIGURATION_LOAD_FAILED } from './constants';
import { getConfiguration } from './index';

const respond = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getConfiguration', () => {
  it('fetches /configuration.json with a timeout', async () => {
    const spy = respond(TEST_WEB_CONFIGURATION);

    await getConfiguration();

    expect(spy).toHaveBeenCalledWith('/configuration.json', {
      signal: expect.any(AbortSignal),
    });
  });

  it('returns the served configuration as is', async () => {
    respond(TEST_WEB_CONFIGURATION);

    await expect(getConfiguration()).resolves.toEqual(TEST_WEB_CONFIGURATION);
  });

  it('loads a configuration that has keys this build does not know', async () => {
    respond({
      ...TEST_WEB_CONFIGURATION,
      brandNew: true,
      services: {
        api: {
          endpoints: { ...TEST_WEB_CONFIGURATION.services.api.endpoints, brandNew: '/api/v1/new' },
        },
      },
    });

    await expect(getConfiguration()).resolves.toEqual(TEST_WEB_CONFIGURATION);
  });

  it('throws on a non-ok response', async () => {
    respond({}, 503);

    await expect(getConfiguration()).rejects.toThrow(CONFIGURATION_LOAD_FAILED);
  });

  it.each([
    ['the previous version', { ...TEST_WEB_CONFIGURATION, version: 1 }],
    ['a missing section', { ...TEST_WEB_CONFIGURATION, settings: undefined }],
  ])('throws on %s', async (_name, body) => {
    respond(body);

    await expect(getConfiguration()).rejects.toThrow();
  });

  it('throws when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network'));

    await expect(getConfiguration()).rejects.toThrow('network');
  });
});
