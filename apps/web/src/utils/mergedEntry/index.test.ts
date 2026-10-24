import { mergedEntry } from './index';

const entries = { default: { retry: 1, timeoutMs: 10_000 }, me: { timeoutMs: 5_000 } };

describe('mergedEntry', () => {
  it('returns the default entry for an unnamed key', () => {
    expect(mergedEntry(entries, 'other')).toEqual({ retry: 1, timeoutMs: 10_000 });
    expect(mergedEntry(entries, undefined)).toEqual({ retry: 1, timeoutMs: 10_000 });
  });

  it('lets the named entry override only the fields it sets', () => {
    expect(mergedEntry(entries, 'me')).toEqual({ retry: 1, timeoutMs: 5_000 });
  });
});
