import type { IEvent } from '@fridgeboard/contract/events';
import { ShopColor } from '../../../../services/shoppingList/constants';
import { toCalendarEvent } from '.';

const stored: IEvent = {
  id: 'e-1',
  title: 'Dentist',
  note: '',
  ownerId: 'household',
  eventType: 'event',
  allDay: false,
  startDate: '2026-11-03',
  endDate: '2026-11-03',
  startsAt: '2026-11-03T09:00:00Z',
  endsAt: '2026-11-03T10:00:00Z',
};

describe('toCalendarEvent', () => {
  it('keeps a colour the palette knows', () => {
    expect(toCalendarEvent({ event: { ...stored, color: 'mint' } })).toMatchObject({
      color: ShopColor.Mint,
    });
  });

  it('drops a colour the palette does not know', () => {
    expect(toCalendarEvent({ event: { ...stored, color: 'beige' } })).not.toHaveProperty('color');
  });

  it('keeps the reminder, including zero minutes', () => {
    expect(toCalendarEvent({ event: { ...stored, reminder: 0 } })).toMatchObject({ reminder: 0 });
  });

  it('leaves colour and reminder out when the event has none', () => {
    const event = toCalendarEvent({ event: stored });

    expect(event).not.toHaveProperty('color');
    expect(event).not.toHaveProperty('reminder');
  });

  it('keeps an all-day event as an all-day event with its dates', () => {
    const allDay: IEvent = {
      id: 'e-2',
      title: 'Trip',
      note: '',
      ownerId: 'household',
      eventType: 'event',
      allDay: true,
      startDate: '2026-11-10',
      endDate: '2026-11-12',
    };

    expect(toCalendarEvent({ event: allDay })).toMatchObject({
      allDay: true,
      startDate: '2026-11-10',
      endDate: '2026-11-12',
    });
  });

  it('keeps the rule an occurrence came from', () => {
    expect(toCalendarEvent({ event: { ...stored, ruleId: 'r-1' } })).toMatchObject({
      ruleId: 'r-1',
    });
  });
});
