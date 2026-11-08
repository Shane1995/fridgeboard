import { readBodyObject } from './index.ts';

const body = (value: unknown, isBase64Encoded = false) => ({
  body: isBase64Encoded
    ? Buffer.from(JSON.stringify(value)).toString('base64')
    : JSON.stringify(value),
  isBase64Encoded,
});

describe('readBodyObject', () => {
  it('reads a plain object field', () => {
    expect(readBodyObject(body({ credential: { id: 'abc' } }), 'credential')).toEqual({
      id: 'abc',
    });
  });

  it('decodes a base64 body', () => {
    expect(readBodyObject(body({ credential: { id: 'abc' } }, true), 'credential')).toEqual({
      id: 'abc',
    });
  });

  it.each([{ credential: 'x' }, { credential: null }, { credential: ['a'] }, {}, 'text'])(
    'returns undefined for %j',
    (value) => {
      expect(readBodyObject(body(value), 'credential')).toBeUndefined();
    },
  );

  it('returns undefined for a body that is not JSON or is missing', () => {
    expect(readBodyObject({ body: 'nope', isBase64Encoded: false }, 'credential')).toBeUndefined();
    expect(readBodyObject({ isBase64Encoded: false }, 'credential')).toBeUndefined();
  });
});
