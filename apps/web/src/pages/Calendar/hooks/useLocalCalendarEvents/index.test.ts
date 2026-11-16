import { act, renderHook, screen } from '@testing-library/react';
import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { ToastProvider } from '../../../../Context/Toast';
import { CALENDAR_COPY } from '../../constants';
import { useLocalCalendarEvents } from '.';

const draft = {
  title: 'Picnic',
  allDay: true,
  date: '2026-11-03',
  startTime: '09:00',
  endTime: '10:00',
  ownerId: 'household',
  note: '',
};

describe('useLocalCalendarEvents', () => {
  it('starts with the dummy events', () => {
    const { result } = renderHook(() => useLocalCalendarEvents());
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('creates, updates and deletes an event', () => {
    const { result } = renderHook(() => useLocalCalendarEvents());
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

  describe('telling the user what happened', () => {
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(ToastProvider, null, children);

    it('says an event was added', async () => {
      const { result } = renderHook(() => useLocalCalendarEvents(), { wrapper });

      act(() => result.current.createEvent({ draft }));

      expect(await screen.findByText(CALENDAR_COPY.eventAdded('Picnic'))).toBeInTheDocument();
    });

    it('says an event was updated', async () => {
      const { result } = renderHook(() => useLocalCalendarEvents(), { wrapper });
      act(() => result.current.createEvent({ draft }));
      const created = result.current.events.find((event) => event.title === 'Picnic');

      act(() =>
        result.current.updateEvent({ id: created?.id ?? '', draft: { ...draft, title: 'Brunch' } }),
      );

      expect(await screen.findByText(CALENDAR_COPY.eventUpdated('Brunch'))).toBeInTheDocument();
    });

    it('says nothing when an event is saved without changes', async () => {
      const { result } = renderHook(() => useLocalCalendarEvents(), { wrapper });
      act(() => result.current.createEvent({ draft }));
      const created = result.current.events.find((event) => event.title === 'Picnic');

      act(() => result.current.updateEvent({ id: created?.id ?? '', draft }));

      expect(screen.queryByText(CALENDAR_COPY.eventUpdated('Picnic'))).not.toBeInTheDocument();
    });

    it('says an event was deleted, by name', async () => {
      const { result } = renderHook(() => useLocalCalendarEvents(), { wrapper });
      act(() => result.current.createEvent({ draft }));
      const created = result.current.events.find((event) => event.title === 'Picnic');

      act(() => result.current.deleteEvent({ id: created?.id ?? '' }));

      expect(await screen.findByText(CALENDAR_COPY.eventDeleted('Picnic'))).toBeInTheDocument();
    });

    it('says nothing when the event to delete does not exist', () => {
      const { result } = renderHook(() => useLocalCalendarEvents(), { wrapper });

      act(() => result.current.deleteEvent({ id: 'missing' }));

      expect(screen.queryByText(/deleted$/)).not.toBeInTheDocument();
    });
  });
});
