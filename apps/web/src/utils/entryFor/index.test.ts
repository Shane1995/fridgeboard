import { entryFor } from './index';

describe('entryFor', () => {
  const entries = { default: { retry: 1 }, me: { retry: 4 } };

  it('returns the entry with that name', () => {
    expect(entryFor(entries, 'me')).toEqual({ retry: 4 });
  });

  it.each(['other', undefined, 1])('returns undefined for %s', (name) => {
    expect(entryFor(entries, name)).toBeUndefined();
  });
});
