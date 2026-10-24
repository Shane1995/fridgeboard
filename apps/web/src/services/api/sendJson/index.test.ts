import { endpoint } from '../../../testUtils/endpoint';
import { FailureReason } from '../../session/constants';
import { sendJson } from './index';

const REASONS = ['taken', 'invalid'] as const;
const json = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }));

describe('sendJson', () => {
  it('sends the method and JSON body and returns the response data', async () => {
    const fetcher = json(200, { username: 'jess' });

    await expect(
      sendJson(endpoint('/api/v1/me/username'), 'PUT', { username: 'jess' }, REASONS, fetcher),
    ).resolves.toEqual({ ok: true, data: { username: 'jess' } });
    expect(fetcher).toHaveBeenCalledWith(endpoint('/api/v1/me/username'), {
      method: 'PUT',
      body: JSON.stringify({ username: 'jess' }),
    });
  });

  it.each(REASONS)('maps the %s failure reason', async (reason) => {
    await expect(
      sendJson(endpoint('/api/v1/x'), 'POST', {}, REASONS, json(409, { reason })),
    ).resolves.toEqual({ ok: false, reason });
  });

  it('returns undefined data for an empty success body', async () => {
    await expect(
      sendJson(
        endpoint('/api/v1/x'),
        'POST',
        undefined,
        REASONS,
        vi.fn(async () => new Response(null, { status: 204 })),
      ),
    ).resolves.toEqual({ ok: true, data: undefined });
  });

  it('falls back to unknown for unrecognised or unreadable failures', async () => {
    await expect(
      sendJson(endpoint('/api/v1/x'), 'POST', {}, REASONS, json(500, { reason: 'boom' })),
    ).resolves.toEqual({ ok: false, reason: FailureReason.Unknown });
    await expect(
      sendJson(
        endpoint('/api/v1/x'),
        'POST',
        {},
        REASONS,
        vi.fn(async () => new Response('nope', { status: 502 })),
      ),
    ).resolves.toEqual({ ok: false, reason: FailureReason.Unknown });
  });
});
