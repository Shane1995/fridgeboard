import { toQueryOptions } from './index';

describe('toQueryOptions', () => {
  it('maps every field to its TanStack name', () => {
    expect(
      toQueryOptions({ staleTimeMs: 1, gcTimeMs: 2, retry: 3, refetchOnWindowFocus: false }),
    ).toEqual({
      staleTime: 1,
      gcTime: 2,
      retry: expect.any(Function),
      refetchOnWindowFocus: false,
    });
  });

  it('omits fields that are absent', () => {
    expect(toQueryOptions({})).toEqual({});
  });

  it('keeps zero and false values', () => {
    expect(toQueryOptions({ staleTimeMs: 0, retry: 0, refetchOnWindowFocus: false })).toEqual({
      staleTime: 0,
      retry: expect.any(Function),
      refetchOnWindowFocus: false,
    });
  });

  it('retries up to the configured count but not on a client error', () => {
    const { retry } = toQueryOptions({ retry: 2 });

    expect(retry?.(1, new Error('down', { cause: 503 }))).toBe(true);
    expect(retry?.(2, new Error('down', { cause: 503 }))).toBe(false);
    expect(retry?.(0, new Error('unauthorised', { cause: 401 }))).toBe(false);
  });
});
