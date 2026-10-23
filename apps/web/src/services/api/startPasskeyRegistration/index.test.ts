import { endpoint } from '../../../testUtils/endpoint';
import { startPasskeyRegistration } from '.';

const json = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }));

describe('startPasskeyRegistration', () => {
  it('POSTs and returns the creation options', async () => {
    const fetcher = json(200, { options: { challenge: 'abc', user: { id: 'u' } } });

    await expect(
      startPasskeyRegistration(endpoint('/api/v1/auth/passkeys/start'), fetcher),
    ).resolves.toEqual({
      ok: true,
      options: { challenge: 'abc', user: { id: 'u' } },
    });
    expect(fetcher).toHaveBeenCalledWith(endpoint('/api/v1/auth/passkeys/start'), {
      method: 'POST',
    });
  });

  it('maps the recent-code requirement', async () => {
    await expect(
      startPasskeyRegistration(endpoint('/x'), json(403, { reason: 'recent-code-required' })),
    ).resolves.toEqual({ ok: false, reason: 'recent-code-required' });
  });

  it('reports unknown for unusable options or unreadable errors', async () => {
    await expect(
      startPasskeyRegistration(endpoint('/x'), json(200, { options: { nope: 1 } })),
    ).resolves.toEqual({ ok: false, reason: 'unknown' });
    await expect(
      startPasskeyRegistration(
        endpoint('/x'),
        vi.fn(async () => new Response('nope', { status: 502 })),
      ),
    ).resolves.toEqual({ ok: false, reason: 'unknown' });
  });
});
