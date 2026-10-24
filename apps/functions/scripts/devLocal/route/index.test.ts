import { ROUTES } from './index.ts';

describe('ROUTES', () => {
  it('serves the real Lambdas behind a JWT and the auth stubs without one', () => {
    expect(ROUTES.get('GET /api/v1/me')?.jwt).toBe(true);
    expect(ROUTES.get('PUT /api/v1/me/username')?.jwt).toBe(true);
    expect(ROUTES.get('POST /api/v1/households')?.jwt).toBe(true);
    expect(ROUTES.get('POST /api/v1/auth/start')?.jwt).toBe(false);
  });

  it('has no passkey routes', () => {
    expect([...ROUTES.keys()].filter((key) => key.includes('passkey'))).toEqual([]);
  });
});
