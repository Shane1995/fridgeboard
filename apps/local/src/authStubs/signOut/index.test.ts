import { signOut } from './index.ts';

describe('signOut stub', () => {
  it('returns 204 and clears the refresh cookie', async () => {
    const result = await signOut();

    expect(result.statusCode).toBe(204);
    expect(result.cookies?.[0]).toContain('fb_rt=;');
  });
});
