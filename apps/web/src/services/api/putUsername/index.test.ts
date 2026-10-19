import { putUsername } from './index';

const json = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }));

describe('putUsername', () => {
  it('PUTs the username and returns the stored one', async () => {
    const fetcher = json(200, { username: 'Jess' });

    await expect(putUsername('/api/v1/username', 'Jess', fetcher)).resolves.toEqual({
      ok: true,
      username: 'Jess',
    });
    expect(fetcher).toHaveBeenCalledWith('/api/v1/username', {
      method: 'PUT',
      body: JSON.stringify({ username: 'Jess' }),
    });
  });

  it.each(['invalid-username', 'username-taken', 'username-set'])(
    'maps the %s failure reason',
    async (reason) => {
      await expect(putUsername('/api/v1/username', 'x', json(409, { reason }))).resolves.toEqual({
        ok: false,
        reason,
      });
    },
  );

  it('falls back to unknown for unrecognised or unreadable failures', async () => {
    await expect(
      putUsername('/api/v1/username', 'x', json(500, { reason: 'boom' })),
    ).resolves.toEqual({ ok: false, reason: 'unknown' });
    await expect(
      putUsername(
        '/api/v1/username',
        'x',
        vi.fn(async () => new Response('nope', { status: 502 })),
      ),
    ).resolves.toEqual({ ok: false, reason: 'unknown' });
  });
});
