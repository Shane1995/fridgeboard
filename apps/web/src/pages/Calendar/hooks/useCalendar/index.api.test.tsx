import { act, waitFor } from '@testing-library/react';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { renderHookWithHousehold } from '../../../../testUtils/createShoppingListWrapper';
import { resetFakeEvents, seedFakeEvents } from '../../../../testUtils/fakeEventsApi';
import type { CalendarEvent } from '../../types';
import { CalendarView } from '../../constants';
import { useCalendar } from '.';

const eventRequests = (apiFetch: { mock: { calls: unknown[][] } }): string[] =>
  apiFetch.mock.calls
    .map(([endpoint]) => (endpoint as { path: string }).path)
    .filter((path) => path.includes('/events'));

const mounted = async () => {
  const rendered = await renderHookWithHousehold(() => useCalendar(), {
    flags: { [WebFeatureFlag.ENABLE_CALENDAR]: true, [WebFeatureFlag.ENABLE_CALENDAR_API]: true },
  });
  await waitFor(() => expect(eventRequests(rendered.apiFetch)).toHaveLength(1));
  return rendered;
};

describe('useCalendar with the events API on', () => {
  beforeEach(() => {
    resetFakeEvents();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-11T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('asks for the whole month grid once, from its first day to its last', async () => {
    const { apiFetch } = await mounted();

    expect(eventRequests(apiFetch)).toEqual([
      '/api/v1/households/hh-1/events?from=2026-11-01&to=2026-12-05',
    ]);
  });

  it('asks for nothing more when switching to the week view and stepping a week inside the month', async () => {
    const { result, apiFetch } = await mounted();

    act(() => result.current.setView(CalendarView.Week));
    act(() => result.current.step({ direction: 1 }));

    expect(result.current.anchor).toBe('2026-11-18');
    expect(eventRequests(apiFetch)).toHaveLength(1);
  });

  it('asks for the next month grid when it steps into the next month', async () => {
    const { result, apiFetch } = await mounted();

    act(() => result.current.step({ direction: 1 }));

    await waitFor(() => expect(eventRequests(apiFetch)).toHaveLength(2));
    expect(eventRequests(apiFetch)[1]).toBe(
      '/api/v1/households/hh-1/events?from=2026-11-29&to=2027-01-02',
    );
  });

  it('does not ask again when it steps back to a month it has already loaded', async () => {
    const { result, apiFetch } = await mounted();
    act(() => result.current.step({ direction: 1 }));
    await waitFor(() => expect(eventRequests(apiFetch)).toHaveLength(2));

    act(() => result.current.step({ direction: -1 }));

    expect(result.current.anchor.slice(0, 7)).toBe('2026-11');
    expect(eventRequests(apiFetch)).toHaveLength(2);
  });

  it('passes the chosen scope on when a day of a series is saved or deleted', async () => {
    seedFakeEvents([
      {
        id: 'rule-1_2026-11-12',
        ruleId: 'rule-1',
        title: 'Recycling',
        note: '',
        ownerId: 'household',
        eventType: 'event',
        allDay: true,
        startDate: '2026-11-12',
        endDate: '2026-11-12',
      },
    ]);
    const { result, apiFetch } = await mounted();
    await waitFor(() => expect(Object.keys(result.current.eventsByDay).length).toBeGreaterThan(0));
    const series = result.current.eventsByDay['2026-11-12']?.[0];
    act(() => result.current.openEdit({ event: series as CalendarEvent }));

    act(() =>
      result.current.saveDraft({
        scope: 'all',
        draft: {
          title: 'Paper',
          allDay: true,
          date: '2026-11-12',
          startTime: '09:00',
          endTime: '10:00',
          ownerId: 'household',
          note: '',
        },
      }),
    );
    act(() => result.current.removeEditing({ scope: 'all' }));

    await waitFor(() => {
      const writes = apiFetch.mock.calls
        .map(([endpoint, init]) => [
          (endpoint as { path: string }).path,
          (init as RequestInit | undefined)?.method,
        ])
        .filter(([path, method]) => String(path).includes('/event-rules/') && method !== undefined);
      expect(writes).toEqual([
        ['/api/v1/households/hh-1/event-rules/rule-1', 'PATCH'],
        ['/api/v1/households/hh-1/event-rules/rule-1', 'DELETE'],
      ]);
    });
  });
});
