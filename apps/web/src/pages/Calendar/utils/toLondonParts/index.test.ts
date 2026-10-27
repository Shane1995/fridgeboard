import { toLondonParts } from '.';

describe('toLondonParts', () => {
  it('keeps winter time as UTC', () => {
    expect(toLondonParts({ instant: '2026-01-15T10:30:00.000Z' })).toEqual({
      date: '2026-01-15',
      time: '10:30',
    });
  });

  it('adds an hour in summer', () => {
    expect(toLondonParts({ instant: '2026-07-15T10:30:00.000Z' })).toEqual({
      date: '2026-07-15',
      time: '11:30',
    });
  });

  it('rolls into the next London day', () => {
    expect(toLondonParts({ instant: '2026-07-15T23:30:00.000Z' })).toEqual({
      date: '2026-07-16',
      time: '00:30',
    });
  });
});
