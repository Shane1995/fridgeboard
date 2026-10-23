import {
  QueryEntriesSchema,
  QueryEntrySchema,
  retryCount,
} from '../../../../packages/contract/src/configuration/queries/index.ts';

const DEFAULT = {
  gcTimeMs: 300_000,
  refetchOnWindowFocus: true,
  retry: 1,
  staleTimeMs: 30_000,
  timeoutMs: 10_000,
};

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
  it('accepts a partial named entry and rejects unknown keys', () => {
    expect(QueryEntrySchema.safeParse({ staleTimeMs: 1000, retry: 2 }).success).toBe(true);
    expect(QueryEntrySchema.safeParse({ nope: 1 }).success).toBe(false);
  });

  it('requires every key in the default entry', () => {
    expect(QueryEntriesSchema.safeParse({ default: DEFAULT }).success).toBe(true);
    expect(QueryEntriesSchema.safeParse({ default: { retry: 1 } }).success).toBe(false);
    expect(QueryEntriesSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a me staleTimeMs above the allowed maximum', () => {
    expect(
      QueryEntriesSchema.safeParse({ default: DEFAULT, me: { staleTimeMs: 300_001 } }).success,
    ).toBe(false);
    expect(
      QueryEntriesSchema.safeParse({ default: DEFAULT, me: { staleTimeMs: 300_000 } }).success,
    ).toBe(true);
  });
});
