import { encodeToken } from '../../encodeToken/index.ts';
import { refresh } from './index.ts';

describe('refresh stub', () => {
  it('issues a new session for a valid refresh cookie', async () => {
    const token = encodeToken({ sub: 's', email: 'a@x.com', groups: [] });

    const result = await refresh({ cookies: [`fb_rt=${token}`], isBase64Encoded: false });

    expect(result.statusCode).toBe(200);
  });

  it('returns 401 and clears the cookie without one', async () => {
    const result = await refresh({ cookies: [], isBase64Encoded: false });

    expect(result.statusCode).toBe(401);
    expect(result.cookies?.[0]).toContain('fb_rt=;');
  });
});
