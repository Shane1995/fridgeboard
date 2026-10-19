import { postHousehold } from './index';

const json = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }));

describe('postHousehold', () => {
  it('POSTs the name and returns the created household', async () => {
    const fetcher = json(201, { id: 'hh-1', name: 'Home', role: 'owner' });

    await expect(postHousehold('/api/v1/households', 'Home', fetcher)).resolves.toEqual({
      ok: true,
      id: 'hh-1',
      name: 'Home',
    });
    expect(fetcher).toHaveBeenCalledWith('/api/v1/households', {
      method: 'POST',
      body: JSON.stringify({ name: 'Home' }),
    });
  });

  it.each(['invalid-name', 'not-allowed', 'household-exists'])(
    'maps the %s failure reason',
    async (reason) => {
      await expect(
        postHousehold('/api/v1/households', 'x', json(409, { reason })),
      ).resolves.toEqual({
        ok: false,
        reason,
      });
    },
  );

  it('falls back to unknown for unrecognised or unreadable failures', async () => {
    await expect(
      postHousehold('/api/v1/households', 'x', json(500, { reason: 'boom' })),
    ).resolves.toEqual({ ok: false, reason: 'unknown' });
    await expect(
      postHousehold(
        '/api/v1/households',
        'x',
        vi.fn(async () => new Response('nope', { status: 502 })),
      ),
    ).resolves.toEqual({ ok: false, reason: 'unknown' });
  });
});
