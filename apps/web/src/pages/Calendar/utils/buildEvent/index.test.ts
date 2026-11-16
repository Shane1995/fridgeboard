import { ShopColor } from '../../../../services/shoppingList/constants';
import { buildEvent } from '.';

const draft = {
  title: '  Dentist ',
  allDay: false,
  date: '2026-11-03',
  startTime: '09:00',
  endTime: '10:00',
  ownerId: 'shane',
  note: ' bring card ',
};

describe('buildEvent', () => {
  it('builds a timed event with trimmed text', () => {
    expect(buildEvent({ draft, id: 'e1' })).toEqual({
      id: 'e1',
      title: 'Dentist',
      ownerId: 'shane',
      note: 'bring card',
      allDay: false,
      startsAt: '2026-11-03T09:00:00.000Z',
      endsAt: '2026-11-03T10:00:00.000Z',
    });
  });

  it('builds an all-day event on a single date', () => {
    expect(buildEvent({ draft: { ...draft, allDay: true }, id: 'e2' })).toEqual({
      id: 'e2',
      title: 'Dentist',
      ownerId: 'shane',
      note: 'bring card',
      allDay: true,
      startDate: '2026-11-03',
      endDate: '2026-11-03',
    });
  });

  it('builds an all-day event across several days', () => {
    expect(
      buildEvent({ draft: { ...draft, allDay: true, endDate: '2026-11-05' }, id: 'e3' }),
    ).toMatchObject({ allDay: true, startDate: '2026-11-03', endDate: '2026-11-05' });
  });

  it('carries the colour and reminder the draft chose', () => {
    expect(
      buildEvent({ draft: { ...draft, color: ShopColor.Mint, reminder: 30 }, id: 'e4' }),
    ).toMatchObject({ color: 'mint', reminder: 30 });
  });

  it('leaves colour and reminder out when the draft has none', () => {
    const event = buildEvent({ draft, id: 'e5' });

    expect(event).not.toHaveProperty('color');
    expect(event).not.toHaveProperty('reminder');
  });
});
