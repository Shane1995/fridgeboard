import { decodeToken } from '../decodeToken/index.ts';
import { encodeToken } from './index.ts';

describe('encodeToken', () => {
  it('round-trips claims through decodeToken', () => {
    const claims = { sub: 's1', email: 'a@x.com', groups: ['admin'] };

    expect(decodeToken(encodeToken(claims))).toEqual(claims);
  });
});
