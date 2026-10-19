import { stripUnknownEntryKeys } from './index.ts';

describe('stripUnknownEntryKeys', () => {
  it('drops unknown keys inside each entry of the section', () => {
    const raw = { version: 1, queries: { me: { retry: 1, bogus: 2 }, default: { x: 1 } } };

    expect(stripUnknownEntryKeys(raw, 'queries', ['retry'])).toEqual({
      version: 1,
      queries: { me: { retry: 1 }, default: {} },
    });
  });

  it('leaves non-object entries for the schema to reject', () => {
    const raw = { queries: { me: 'oops' } };

    expect(stripUnknownEntryKeys(raw, 'queries', ['retry'])).toEqual(raw);
  });

  it.each([
    ['null', null],
    ['no section', { version: 1 }],
    ['array section', { queries: [] }],
  ])('returns %s input untouched', (_label, raw) => {
    expect(stripUnknownEntryKeys(raw, 'queries', ['retry'])).toBe(raw);
  });
});
