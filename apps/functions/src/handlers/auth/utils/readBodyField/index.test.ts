import { readBodyField } from './index.ts';

describe('readBodyField', () => {
  it('reads a string field from a JSON body', () => {
    expect(readBodyField({ body: '{"email":"a@b.c"}', isBase64Encoded: false }, 'email')).toBe(
      'a@b.c',
    );
  });

  it('decodes a base64 body', () => {
    const body = Buffer.from('{"code":"123456"}').toString('base64');

    expect(readBodyField({ body, isBase64Encoded: true }, 'code')).toBe('123456');
  });

  it('returns an empty string for missing, non-string or malformed input', () => {
    expect(readBodyField({ isBase64Encoded: false }, 'email')).toBe('');
    expect(readBodyField({ body: '{"code":123456}', isBase64Encoded: false }, 'code')).toBe('');
    expect(readBodyField({ body: 'null', isBase64Encoded: false }, 'code')).toBe('');
    expect(readBodyField({ body: '{oops', isBase64Encoded: false }, 'email')).toBe('');
  });
});
