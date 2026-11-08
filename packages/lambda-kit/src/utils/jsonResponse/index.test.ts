import { jsonResponse } from './index.ts';

describe('jsonResponse', () => {
  it('builds a JSON response with cookies', () => {
    expect(jsonResponse(403, { reason: 'forbidden' }, ['a=1'])).toEqual({
      statusCode: 403,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      body: '{"reason":"forbidden"}',
      cookies: ['a=1'],
    });
  });

  it('defaults to no cookies', () => {
    expect(jsonResponse(200, { accessToken: 'a', expiresIn: 900 }).cookies).toEqual([]);
  });
});
