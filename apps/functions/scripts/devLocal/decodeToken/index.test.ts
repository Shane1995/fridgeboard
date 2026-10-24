import { decodeToken } from './index.ts';

describe('decodeToken', () => {
  it.each([undefined, '', 'abc', 'local.', 'local.%%%', `local.${btoa('{"sub":1}')}`])(
    'returns undefined for %s',
    (token) => {
      expect(decodeToken(token)).toBeUndefined();
    },
  );
});
