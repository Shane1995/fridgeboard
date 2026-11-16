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
});
