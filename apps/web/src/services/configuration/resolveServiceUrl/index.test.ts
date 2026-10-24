import { resolveServiceUrl } from '.';

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
    expect(resolveServiceUrl({ url: '/api/{id}' }, { id: 'x y/z' })).toBe('/api/x%20y%2Fz');
  });

  it.each(['..', '../x', 'a..b'])('throws when a value resolves to a traversal: %s', (id) => {
    expect(() => resolveServiceUrl({ url: '/api/{id}' }, { id })).toThrow('safe api path');
  });

  it('throws when the resolved path leaves /api/', () => {
    expect(() => resolveServiceUrl({ url: '/x/{id}' }, { id: 'api' })).toThrow('safe api path');
  });

  it('throws on an unresolved placeholder', () => {
    expect(() => resolveServiceUrl({ url: '/api/{id}' })).toThrow('Unresolved placeholder {id}');
  });

  it('layers service params under call values', () => {
    const service = {
      url: '/api/{a}/{b}',
      params: { a: 'service', b: 'service' },
    };

    expect(resolveServiceUrl(service, { b: 'call' })).toBe('/api/service/call');
  });
});
