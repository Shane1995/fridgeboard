import { readWindow } from './index.ts';

describe('readWindow', () => {
  it('reads a month', () => {
    expect(readWindow({ query: { from: '2026-11-01', to: '2026-11-30' } })).toEqual({
      from: '2026-11-01',
      to: '2026-11-30',
    });
  });

  it('accepts a window of 62 days, counting both ends', () => {
    expect(readWindow({ query: { from: '2026-11-01', to: '2027-01-01' } })).toBeDefined();
  });

  it('refuses a window of 63 days', () => {
    expect(readWindow({ query: { from: '2026-11-01', to: '2027-01-02' } })).toBeUndefined();
  });

  it('accepts a single day', () => {
    expect(readWindow({ query: { from: '2026-11-01', to: '2026-11-01' } })).toBeDefined();
  });

  it('refuses a window that ends before it starts', () => {
    expect(readWindow({ query: { from: '2026-11-05', to: '2026-11-01' } })).toBeUndefined();
  });

  it.each([
    [undefined],
    [{}],
    [{ from: '2026-11-01' }],
    [{ to: '2026-11-30' }],
    [{ from: '2026-02-30', to: '2026-03-02' }],
    [{ from: '2026-11-01', to: 'tomorrow' }],
  ])('refuses the query %j', (query) => {
    expect(readWindow({ query })).toBeUndefined();
  });
});
