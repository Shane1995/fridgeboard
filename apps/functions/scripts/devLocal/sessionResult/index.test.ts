import { decodeToken } from '../decodeToken/index.ts';
import { sessionResult } from './index.ts';

describe('sessionResult', () => {
  it('returns a token for the email and sets the refresh cookie while clearing the flow cookie', () => {
    const result = sessionResult('a@x.com');

    const { accessToken } = JSON.parse(String(result.body));
    expect(decodeToken(accessToken)?.email).toBe('a@x.com');
    expect(result.cookies?.[0]).toContain(`fb_rt=${accessToken}`);
    expect(result.cookies?.[1]).toContain('fb_auth_flow=;');
  });
});
