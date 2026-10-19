import { QueryEntriesSchema, QueryEntrySchema, retryCount } from './index.ts';

describe('retryCount', () => {
  it.each([
    [0, true],
    [5, true],
    [-1, false],
    [6, false],
    [1.5, false],
  ])('bounds retry: %s -> %s', (value, ok) => {
    expect(retryCount.safeParse(value).success).toBe(ok);
  });
});

describe('query entry schemas', () => {
  it('accepts a valid entry and rejects unknown keys', () => {
    expect(QueryEntrySchema.safeParse({ staleTimeMs: 1000, retry: 2 }).success).toBe(true);
    expect(QueryEntrySchema.safeParse({ nope: 1 }).success).toBe(false);
  });

  it('rejects a me staleTimeMs above the allowed maximum', () => {
    expect(QueryEntriesSchema.safeParse({ me: { staleTimeMs: 300_001 } }).success).toBe(false);
    expect(QueryEntriesSchema.safeParse({ me: { staleTimeMs: 300_000 } }).success).toBe(true);
  });
});
