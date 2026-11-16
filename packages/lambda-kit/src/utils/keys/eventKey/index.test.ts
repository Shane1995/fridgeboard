import { eventKey } from './index.ts';

describe('eventKey', () => {
  it('puts the start date before the id', () => {
    expect(eventKey({ householdId: 'hh-1', startDate: '2026-11-03', eventId: 'e-1' })).toEqual({
      PK: 'HH#hh-1',
      SK: 'EVENT#2026-11-03#e-1',
    });
  });
});
