import { sanitizeRedirect } from './index';

describe('sanitizeRedirect', () => {
  it.each(['/', '/list', '/list?tab=1', '/a/b#c'])('keeps the same-origin path %s', (path) => {
    expect(sanitizeRedirect(path)).toBe(path);
  });

  it.each([
    '//evil.com',
    'https://evil.com',
    '/\\evil.com',
    '/\\/evil.com',
    'javascript:alert(1)',
    'evil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    '',
    ' //evil.com',
  ])('drops the hostile value %j to /', (value) => {
    expect(sanitizeRedirect(value)).toBe('/');
  });

  it.each([undefined, null, 42, {}, ['/a']])('drops the non-string value %j to /', (value) => {
    expect(sanitizeRedirect(value)).toBe('/');
  });
});
