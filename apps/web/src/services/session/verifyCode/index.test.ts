import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { verifyCode } from './index';

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const respond = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const fetchMock = vi.fn<typeof fetch>();

describe('verifyCode', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the tokens on success', async () => {
    fetchMock.mockResolvedValue(respond(200, TOKENS));

    await expect(verifyCode(API_PATHS.verify, '12345678')).resolves.toEqual({
      ok: true,
      tokens: TOKENS,
    });
  });

  it('posts the code as JSON with same-origin credentials', async () => {
    fetchMock.mockResolvedValue(respond(200, TOKENS));

    await verifyCode(API_PATHS.verify, '123456');

    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.verify,
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({ code: '123456' }),
      }),
    );
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Content-Type')).toBe(
      'application/json',
    );
  });

  it('returns next enter-code on 202', async () => {
    fetchMock.mockResolvedValue(respond(202, { next: 'enter-code' }));

    await expect(verifyCode(API_PATHS.verify, '123456')).resolves.toEqual({
      ok: false,
      next: 'enter-code',
    });
  });

  it('returns the reason from an error response', async () => {
    fetchMock.mockResolvedValue(respond(400, { reason: 'bad-code' }));

    await expect(verifyCode(API_PATHS.verify, '000000')).resolves.toEqual({
      ok: false,
      reason: 'bad-code',
    });
  });

  it.each([
    [200, 'not json'],
    [200, '{"accessToken":42}'],
    [202, 'not json'],
    [202, '{"next":"elsewhere"}'],
  ])('returns unknown for a malformed %i body', async (status, body) => {
    fetchMock.mockResolvedValue(new Response(body, { status }));

    await expect(verifyCode(API_PATHS.verify, '123456')).resolves.toEqual({
      ok: false,
      reason: 'unknown',
    });
  });
});
