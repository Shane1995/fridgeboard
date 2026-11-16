import type { IEvent } from '@fridgeboard/contract/events';
import { act, screen, waitFor } from '@testing-library/react';
import { renderHookWithHousehold } from '../../../../testUtils/createShoppingListWrapper';
import { resetFakeEvents, seedFakeEvents } from '../../../../testUtils/fakeEventsApi';
import { CALENDAR_COPY } from '../../constants';
import type { CalendarEvent } from '../../types';
import { eventToDraft } from '../../utils/eventToDraft';
import { useApiCalendarEvents } from '.';

const WINDOW = { from: '2026-11-01', to: '2026-12-12' };
const EVENTS_PATH = '/api/v1/households/hh-1/events';

const dentist: IEvent = {
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

const draft = {
  title: 'Dentist',
  allDay: false,
  date: '2026-11-03',
  startTime: '09:00',
  endTime: '10:00',
  ownerId: 'household',
  note: '',
};

const writes = (apiFetch: { mock: { calls: unknown[][] } }) =>
  apiFetch.mock.calls
    .map(([endpoint, init]) => ({
      path: (endpoint as { path: string }).path,
      method: (init as RequestInit | undefined)?.method ?? 'GET',
      body: (init as RequestInit | undefined)?.body,
    }))
    .filter(({ path, method }) => path.startsWith(EVENTS_PATH) && method !== 'GET');

const mounted = async () => {
  const rendered = await renderHookWithHousehold(() => useApiCalendarEvents(WINDOW));
  await waitFor(() => expect(rendered.result.current.events).toHaveLength(1));
  return rendered;
};

describe('useApiCalendarEvents', () => {
  beforeEach(() => {
    resetFakeEvents();
    seedFakeEvents([dentist]);
  });

  it('returns the events of the window', async () => {
    const { result } = await mounted();

    expect(result.current.events.map(({ title }) => title)).toEqual(['Dentist']);
  });

  it('posts a new event from the draft and says it was added', async () => {
    const { result, apiFetch } = await mounted();

    act(() => result.current.createEvent({ draft: { ...draft, title: 'Picnic', allDay: true } }));

    expect(await screen.findByText(CALENDAR_COPY.eventAdded('Picnic'))).toBeInTheDocument();
    expect(writes(apiFetch)).toEqual([
      {
        path: EVENTS_PATH,
        method: 'POST',
        body: JSON.stringify({
          title: 'Picnic',
          note: '',
          ownerId: 'household',
          color: null,
          reminder: null,
          allDay: true,
          startDate: '2026-11-03',
          endDate: '2026-11-03',
        }),
      },
    ]);
  });

  it('patches an event at the date it is stored under', async () => {
    const { result, apiFetch } = await mounted();

    act(() => result.current.updateEvent({ id: 'e-1', draft: { ...draft, title: 'Hygienist' } }));

    expect(await screen.findByText(CALENDAR_COPY.eventUpdated('Hygienist'))).toBeInTheDocument();
    expect(writes(apiFetch).map(({ path, method }) => [path, method])).toEqual([
      [`${EVENTS_PATH}/e-1?date=2026-11-03`, 'PATCH'],
    ]);
  });

  it('sends nothing when the draft changes nothing', async () => {
    const { result, apiFetch } = await mounted();

    act(() => result.current.updateEvent({ id: 'e-1', draft }));

    expect(writes(apiFetch)).toEqual([]);
  });

  it('deletes an event at the date it is stored under and says so', async () => {
    const { result, apiFetch } = await mounted();

    act(() => result.current.deleteEvent({ id: 'e-1' }));

    expect(await screen.findByText(CALENDAR_COPY.eventDeleted('Dentist'))).toBeInTheDocument();
    expect(writes(apiFetch).map(({ path, method }) => [path, method])).toEqual([
      [`${EVENTS_PATH}/e-1?date=2026-11-03`, 'DELETE'],
    ]);
    await waitFor(() => expect(result.current.events).toEqual([]));
  });

  it('ignores an event it does not have', async () => {
    const { result, apiFetch } = await mounted();

    act(() => result.current.deleteEvent({ id: 'missing' }));
    act(() => result.current.updateEvent({ id: 'missing', draft }));

    expect(writes(apiFetch)).toEqual([]);
  });

  it('keeps every day of a multi-day event when its title is edited', async () => {
    seedFakeEvents([
      dentist,
      {
        ...dentist,
        id: 'e-2',
        title: 'Trip',
        allDay: true,
        startDate: '2026-11-10',
        endDate: '2026-11-12',
      } as IEvent,
    ]);
    const { result, apiFetch } = await renderHookWithHousehold(() => useApiCalendarEvents(WINDOW));
    await waitFor(() => expect(result.current.events).toHaveLength(2));
    const trip = result.current.events.find(({ id }) => id === 'e-2');

    act(() =>
      result.current.updateEvent({
        id: 'e-2',
        draft: { ...eventToDraft({ event: trip as CalendarEvent }), title: 'Holiday' },
      }),
    );

    await screen.findByText(CALENDAR_COPY.eventUpdated('Holiday'));
    expect(JSON.parse(String(writes(apiFetch)[0]?.body))).toMatchObject({
      allDay: true,
      startDate: '2026-11-10',
      endDate: '2026-11-12',
    });
  });

  describe('loading', () => {
    it('is loading until the first answer for the window arrives, then not', async () => {
      const { result } = await renderHookWithHousehold(() => useApiCalendarEvents(WINDOW));

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.events).toHaveLength(1);
    });

    it('is not loading while it is switched off', async () => {
      const { result, apiFetch } = await renderHookWithHousehold(() =>
        useApiCalendarEvents({ ...WINDOW, enabled: false }),
      );

      expect(result.current.isLoading).toBe(false);
      expect(
        apiFetch.mock.calls.some(([endpoint]) =>
          (endpoint as { path: string }).path.includes('/events'),
        ),
      ).toBe(false);
    });
  });

  describe('repeating events', () => {
    const occurrence = {
      ...dentist,
      id: 'rule-1_2026-11-12',
      ruleId: 'rule-1',
      title: 'Recycling',
      allDay: true,
      startDate: '2026-11-12',
      endDate: '2026-11-12',
    } as IEvent;
    const occurrenceDraft = {
      title: 'Recycling',
      allDay: true,
      date: '2026-11-12',
      startTime: '09:00',
      endTime: '10:00',
      ownerId: 'household',
      note: '',
    };

    const mountedWithOccurrence = async () => {
      seedFakeEvents([occurrence]);
      const rendered = await renderHookWithHousehold(() => useApiCalendarEvents(WINDOW));
      await waitFor(() => expect(rendered.result.current.events).toHaveLength(1));
      return rendered;
    };

    const allWrites = (apiFetch: { mock: { calls: unknown[][] } }) =>
      apiFetch.mock.calls
        .map(([endpoint, init]) => ({
          path: (endpoint as { path: string }).path,
          method: (init as RequestInit | undefined)?.method ?? 'GET',
          body: (init as RequestInit | undefined)?.body,
        }))
        .filter(({ path, method }) => path.includes('/event') && method !== 'GET');

    it('starts a series, not a single event, when the draft repeats', async () => {
      const { result, apiFetch } = await mounted();

      act(() =>
        result.current.createEvent({
          draft: {
            ...occurrenceDraft,
            title: 'General waste',
            repeat: { frequency: 'weekly', interval: 2, weekdays: [4] },
          },
        }),
      );

      await screen.findByText(CALENDAR_COPY.eventAdded('General waste'));
      expect(allWrites(apiFetch).map(({ path, method }) => [path, method])).toEqual([
        [`${EVENTS_PATH.replace('/events', '')}/event-rules`, 'POST'],
      ]);
    });

    it('turns one day into an event of its own when only that one is saved', async () => {
      const { result, apiFetch } = await mountedWithOccurrence();

      act(() =>
        result.current.updateEvent({
          id: occurrence.id,
          scope: 'one',
          draft: { ...occurrenceDraft, title: 'Recycling (moved)' },
        }),
      );

      await screen.findByText(CALENDAR_COPY.eventUpdated('Recycling (moved)'));
      expect(allWrites(apiFetch).map(({ path, method }) => [path, method])).toEqual([
        ['/api/v1/households/hh-1/event-rules/rule-1/occurrences/2026-11-12', 'POST'],
      ]);
    });

    it('changes the whole series when all of them are saved', async () => {
      const { result, apiFetch } = await mountedWithOccurrence();

      act(() =>
        result.current.updateEvent({
          id: occurrence.id,
          scope: 'all',
          draft: { ...occurrenceDraft, title: 'Paper' },
        }),
      );

      await screen.findByText(CALENDAR_COPY.eventUpdated('Paper'));
      expect(allWrites(apiFetch).map(({ path, method }) => [path, method])).toEqual([
        ['/api/v1/households/hh-1/event-rules/rule-1', 'PATCH'],
      ]);
    });

    it('treats a save with no scope as just this one', async () => {
      const { result, apiFetch } = await mountedWithOccurrence();

      act(() =>
        result.current.updateEvent({
          id: occurrence.id,
          draft: { ...occurrenceDraft, title: 'Paper' },
        }),
      );

      await screen.findByText(CALENDAR_COPY.eventUpdated('Paper'));
      expect(allWrites(apiFetch)[0]?.path).toContain('/occurrences/2026-11-12');
    });

    it('skips one day when only that one is deleted', async () => {
      const { result, apiFetch } = await mountedWithOccurrence();

      act(() => result.current.deleteEvent({ id: occurrence.id, scope: 'one' }));

      await screen.findByText(CALENDAR_COPY.occurrenceSkipped('Recycling'));
      expect(allWrites(apiFetch).map(({ path, method }) => [path, method])).toEqual([
        ['/api/v1/households/hh-1/event-rules/rule-1/occurrences/2026-11-12', 'DELETE'],
      ]);
    });

    it('deletes the whole series when all of them are deleted', async () => {
      const { result, apiFetch } = await mountedWithOccurrence();

      act(() => result.current.deleteEvent({ id: occurrence.id, scope: 'all' }));

      await screen.findByText(CALENDAR_COPY.eventDeleted('Recycling'));
      expect(allWrites(apiFetch).map(({ path, method }) => [path, method])).toEqual([
        ['/api/v1/households/hh-1/event-rules/rule-1', 'DELETE'],
      ]);
    });
  });
});
