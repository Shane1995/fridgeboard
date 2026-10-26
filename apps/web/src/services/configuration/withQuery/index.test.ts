import { withQuery } from '.';

const ENDPOINT = { path: '/api/v1/households/hh-1/changes', timeoutMs: 5_000 };

describe('withQuery', () => {
  it('adds the parameters to the path and keeps the timeout', () => {
    expect(withQuery({ endpoint: ENDPOINT, query: { since: '42' } })).toEqual({
      path: '/api/v1/households/hh-1/changes?since=42',
      timeoutMs: 5_000,
    });
  });

  it('leaves the endpoint alone when there are no parameters', () => {
    expect(withQuery({ endpoint: ENDPOINT, query: {} })).toBe(ENDPOINT);
  });

  it('escapes what it adds', () => {
    expect(withQuery({ endpoint: ENDPOINT, query: { q: 'a b&c' } }).path).toBe(
      '/api/v1/households/hh-1/changes?q=a+b%26c',
    );
  });
});
