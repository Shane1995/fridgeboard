import { bearerToken } from './index.ts';

describe('bearerToken', () => {
  it('reads the token from the Authorization header, any case', () => {
    expect(bearerToken({ authorization: 'Bearer abc.def' })).toBe('abc.def');
    expect(bearerToken({ authorization: 'bearer abc.def' })).toBe('abc.def');
  });

  it.each([
    {},
    { authorization: '' },
    { authorization: 'Basic abc' },
    { authorization: 'Bearer ' },
  ])('returns undefined for %j', (headers) => {
    expect(bearerToken(headers)).toBeUndefined();
  });
});
