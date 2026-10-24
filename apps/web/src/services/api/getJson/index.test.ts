import { endpoint } from '../../../testUtils/endpoint';
import { getJson } from './index';

const BODY = { sub: 'sub-1' };

describe('getJson', () => {
  it('returns the body fetched from the endpoint', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(BODY), { status: 200 }));

    await expect(getJson(endpoint('/api/v1/me'), fetcher)).resolves.toEqual(BODY);
    expect(fetcher).toHaveBeenCalledWith(endpoint('/api/v1/me'));
  });

  it('throws with the status as the cause when the request fails', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 404 }));

    await expect(getJson(endpoint('/api/v1/me'), fetcher)).rejects.toMatchObject({ cause: 404 });
  });
});
