import { readFailureReason } from './index';

describe('readFailureReason', () => {
  it('reads the reason from a JSON error body', async () => {
    const response = new Response(JSON.stringify({ reason: 'expired' }), { status: 400 });

    await expect(readFailureReason(response)).resolves.toBe('expired');
  });

  it('falls back to unknown for an empty body', async () => {
    await expect(readFailureReason(new Response(null, { status: 500 }))).resolves.toBe('unknown');
  });

  it('falls back to unknown for a body without a reason', async () => {
    await expect(readFailureReason(new Response('{}', { status: 500 }))).resolves.toBe('unknown');
  });
});
