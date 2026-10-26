import { publishChange } from './index.ts';

const getConfiguration = vi.hoisted(() => vi.fn());
vi.mock('../../configuration/index.ts', () => ({ getConfiguration }));

const CHANGE = { id: 'abc', rev: 43, type: 'item' as const };
const HOST = 'https://example123.appsync-api.eu-west-2.amazonaws.com';

describe('publishChange', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'AKIDEXAMPLE');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret');
    vi.stubEnv('AWS_SESSION_TOKEN', 'token');
    vi.stubEnv('AWS_REGION', 'eu-west-2');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));
    fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200 });
    getConfiguration.mockReset().mockResolvedValue({ services: { appsyncEvents: { url: HOST } } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('posts the change to the household channel, signed for AppSync', async () => {
    await publishChange({ householdId: 'hh-1', change: CHANGE });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${HOST}/event`);
    expect(JSON.parse(init.body)).toEqual({
      channel: '/hh/hh-1',
      events: [JSON.stringify(CHANGE)],
    });
    expect(init.headers.authorization).toMatch(
      /^AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE\/20261026\/eu-west-2\/appsync\/aws4_request, SignedHeaders=.*, Signature=[0-9a-f]{64}$/,
    );
    expect(init.headers['x-amz-security-token']).toBe('token');
  });

  it('does nothing when no AppSync host is configured', async () => {
    getConfiguration.mockResolvedValue({ services: {} });

    await publishChange({ householdId: 'hh-1', change: CHANGE });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logs and carries on when AppSync refuses the event', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(publishChange({ householdId: 'hh-1', change: CHANGE })).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith('publishChange failed', 403);
  });

  it('logs and carries on when the request cannot be sent', async () => {
    fetchMock.mockRejectedValue(new TypeError('network down'));

    await expect(publishChange({ householdId: 'hh-1', change: CHANGE })).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith('publishChange failed', 'TypeError');
  });

  it('logs and carries on when there are no credentials to sign with', async () => {
    vi.stubEnv('AWS_ACCESS_KEY_ID', '');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', '');
    delete process.env['AWS_ACCESS_KEY_ID'];
    delete process.env['AWS_SECRET_ACCESS_KEY'];

    await publishChange({ householdId: 'hh-1', change: CHANGE });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
