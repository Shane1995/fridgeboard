import { isTokenResponse } from './index';

describe('isTokenResponse', () => {
  it('accepts a token response', () => {
    expect(isTokenResponse({ accessToken: 'token-1', expiresIn: 900 })).toBe(true);
  });

  it.each([
    undefined,
    null,
    'token',
    {},
    { accessToken: 'token-1' },
    { expiresIn: 900 },
    { accessToken: '', expiresIn: 900 },
    { accessToken: 42, expiresIn: 900 },
    { accessToken: 'token-1', expiresIn: '900' },
    { accessToken: 'token-1', expiresIn: Number.NaN },
  ])('rejects %j', (value) => {
    expect(isTokenResponse(value)).toBe(false);
  });
});
