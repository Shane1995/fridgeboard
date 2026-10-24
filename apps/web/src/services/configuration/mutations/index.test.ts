import { MutationEntriesSchema, MutationEntrySchema } from '.';

const DEFAULT = { retry: 0, timeoutMs: 10_000 };

describe('mutation entry schemas', () => {
  it('requires every key in the default entry', () => {
    expect(MutationEntriesSchema.safeParse({ default: DEFAULT }).success).toBe(true);
    expect(MutationEntriesSchema.safeParse({ default: { retry: 0 } }).success).toBe(false);
    expect(MutationEntriesSchema.safeParse({}).success).toBe(false);
  });

  it('accepts a partial signOut entry and rejects other names', () => {
    expect(
      MutationEntriesSchema.safeParse({ default: DEFAULT, signOut: { retry: 1 } }).success,
    ).toBe(true);
    expect(MutationEntriesSchema.safeParse({ default: DEFAULT, other: {} }).success).toBe(false);
  });

  it.each([
    [0, true],
    [2, true],
    [-1, false],
    [3, false],
  ])('bounds retry: %s -> %s', (value, ok) => {
    expect(MutationEntrySchema.safeParse({ retry: value }).success).toBe(ok);
  });
});
