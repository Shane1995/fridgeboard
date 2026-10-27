import { act, renderHook } from '@testing-library/react';
import { useCalendarEvents } from '.';

const draft = {
  title: 'Picnic',
  allDay: true,
  date: '2026-11-03',
  startTime: '09:00',
  endTime: '10:00',
  ownerId: 'household',
  note: '',
};

describe('useCalendarEvents', () => {
  it('starts with the dummy events', () => {
    const { result } = renderHook(() => useCalendarEvents());
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('creates, updates and deletes an event', () => {
    const { result } = renderHook(() => useCalendarEvents());
    const before = result.current.events.length;

    act(() => result.current.createEvent({ draft }));
    const created = result.current.events.find((event) => event.title === 'Picnic');
    expect(result.current.events).toHaveLength(before + 1);

    act(() =>
      result.current.updateEvent({ id: created?.id ?? '', draft: { ...draft, title: 'Brunch' } }),
    );
    expect(result.current.events.some((event) => event.title === 'Brunch')).toBe(true);
    expect(result.current.events.some((event) => event.title === 'Picnic')).toBe(false);

    act(() => result.current.deleteEvent({ id: created?.id ?? '' }));
    expect(result.current.events).toHaveLength(before);
  });
});
