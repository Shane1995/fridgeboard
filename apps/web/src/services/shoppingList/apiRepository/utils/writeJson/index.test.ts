import { REQUEST_FAILED } from '../../constants';
import { writeJson } from './index';

const endpoint = { path: '/api/v1/x', timeoutMs: 1000 };

describe('writeJson', () => {
  it('sends the body and returns the parsed response', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{"id":"a"}', { status: 201 }));

    const data = await writeJson<{ id: string }>({
      endpoint,
      method: 'POST',
      body: { name: 'Milk' },
      fetcher,
    });

    expect(data).toEqual({ id: 'a' });
    expect(fetcher).toHaveBeenCalledWith(endpoint, {
      method: 'POST',
      body: JSON.stringify({ name: 'Milk' }),
    });
  });

  it('throws when the request fails', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response('{"reason":"not-found"}', { status: 404 }));

    await expect(writeJson({ endpoint, method: 'PATCH', fetcher })).rejects.toThrow(REQUEST_FAILED);
  });
});
