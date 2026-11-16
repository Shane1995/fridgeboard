import { ShopColor } from '../../../../services/shoppingList/constants';
import { HOUSEHOLD_OWNER } from '../../constants';
import type { CalendarEvent, CalendarMember } from '../../types';
import { eventColor } from '.';

const owners: readonly CalendarMember[] = [
  HOUSEHOLD_OWNER,
  { id: 'sub-1', name: 'Shane', color: ShopColor.Tomato },
];

const event: CalendarEvent = {
  id: 'e-1',
  title: 'Dentist',
  note: '',
  ownerId: 'sub-1',
  allDay: true,
  startDate: '2026-11-03',
  endDate: '2026-11-03',
};

describe('eventColor', () => {
  it('is the colour the event was given', () => {
    expect(eventColor({ event: { ...event, color: ShopColor.Mint }, owners })).toBe(ShopColor.Mint);
  });

  it('falls back to the colour of its owner', () => {
    expect(eventColor({ event, owners })).toBe(ShopColor.Tomato);
  });

  it('falls back to the household colour for an owner nobody knows', () => {
    expect(eventColor({ event: { ...event, ownerId: 'gone' }, owners })).toBe(
      HOUSEHOLD_OWNER.color,
    );
  });
});
