import { toQueryOptions } from './index';

describe('toQueryOptions', () => {
  it('maps every field to its TanStack name', () => {
    expect(
      toQueryOptions({ staleTimeMs: 1, gcTimeMs: 2, retry: 3, refetchOnWindowFocus: false }),
    ).toEqual({ staleTime: 1, gcTime: 2, retry: 3, refetchOnWindowFocus: false });
  });

  it('omits fields that are absent', () => {
    expect(toQueryOptions({})).toEqual({});
  });

  it('keeps zero and false values', () => {
    expect(toQueryOptions({ staleTimeMs: 0, retry: 0, refetchOnWindowFocus: false })).toEqual({
      staleTime: 0,
      retry: 0,
      refetchOnWindowFocus: false,
    });
  });
});
