import { resolveServiceUrl } from './index.ts';

describe('resolveServiceUrl', () => {
  it('returns a url without placeholders unchanged', () => {
    expect(resolveServiceUrl({ url: '/api/me' })).toBe('/api/me');
  });

  it('substitutes placeholders from params', () => {
    expect(resolveServiceUrl({ url: '/api/{kind}', params: { kind: 'lists' } })).toBe('/api/lists');
  });

  it('prefers supplied values over params', () => {
    expect(resolveServiceUrl({ url: '/api/{id}', params: { id: 'a' } }, { id: 'b' })).toBe(
      '/api/b',
    );
  });

  it('percent-encodes substituted values', () => {
    expect(resolveServiceUrl({ url: '/api/{id}' }, { id: '../x y' })).toBe('/api/..%2Fx%20y');
  });

  it('throws on an unresolved placeholder', () => {
    expect(() => resolveServiceUrl({ url: '/api/{id}' })).toThrow('Unresolved placeholder {id}');
  });
});
