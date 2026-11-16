import type { IEvent } from '@fridgeboard/contract/events';
import { act, screen, waitFor } from '@testing-library/react';
import { useEventsQuery } from '../../../../hooks/useEventsQuery';
import { renderHookWithHousehold } from '../../../../testUtils/createShoppingListWrapper';
import { resetFakeEvents, seedFakeEvents } from '../../../../testUtils/fakeEventsApi';
import { CALENDAR_COPY } from '../../constants';
import { useEventMutations } from '.';

const WINDOW = { from: '2026-11-01', to: '2026-12-12' };
const EVENTS_PATH = '/api/v1/households/hh-1/events';

const allDay = (id: string, startDate: string, endDate = startDate): IEvent => ({
  id,
  title: id,
  note: '',
  ownerId: 'household',
  eventType: 'event',
  allDay: true,
  startDate,
  endDate,
});

const body = (title: string, startDate: string, endDate = startDate) => ({
  title,
  note: '',
  ownerId: 'household',
  allDay: true as const,
  startDate,
  endDate,
});

const mounted = (options?: Parameters<typeof renderHookWithHousehold>[1]) =>
  renderHookWithHousehold(
    () => ({ mutations: useEventMutations(), events: useEventsQuery(WINDOW) }),
    options,
  );

const writes = (apiFetch: { mock: { calls: unknown[][] } }) =>
  apiFetch.mock.calls
    .map(([endpoint, init]) => ({
      path: (endpoint as { path: string }).path,
      method: (init as RequestInit | undefined)?.method ?? 'GET',
    }))
    .filter(({ path, method }) => path.startsWith(EVENTS_PATH) && method !== 'GET');

describe('useEventMutations', () => {
  beforeEach(() => {
    resetFakeEvents();
  });

  it('adds an event to the window it belongs in without asking for the window again', async () => {
    const { result, apiFetch } = await mounted();
    await waitFor(() => expect(result.current.events.data).toEqual([]));
    const reads = apiFetch.mock.calls.length;

    await act(async () => {
      await result.current.mutations.createEvent.mutateAsync({
        body: body('Picnic', '2026-11-20'),
      });
    });

    await waitFor(() =>
      expect(result.current.events.data?.map(({ title }) => title)).toEqual(['Picnic']),
    );
    expect(apiFetch.mock.calls.length).toBe(reads + 1);
    expect(await screen.findByText(CALENDAR_COPY.eventAdded('Picnic'))).toBeInTheDocument();
  });

  it('leaves a new event out of a window it does not overlap', async () => {
    const { result } = await mounted();
    await waitFor(() => expect(result.current.events.data).toEqual([]));

    await act(async () => {
      await result.current.mutations.createEvent.mutateAsync({
        body: body('Summer', '2027-07-01'),
      });
    });

    expect(result.current.events.data).toEqual([]);
  });

  it('patches the event at its current start date and swaps in the saved copy', async () => {
    seedFakeEvents([allDay('a', '2026-11-03'), allDay('b', '2026-11-10')]);
    const { result, apiFetch } = await mounted();
    await waitFor(() => expect(result.current.events.data).toHaveLength(2));

    await act(async () => {
      await result.current.mutations.updateEvent.mutateAsync({
        id: 'a',
        date: '2026-11-03',
        body: body('Holiday', '2026-11-04'),
      });
    });

    expect(writes(apiFetch)).toEqual([
      { path: `${EVENTS_PATH}/a?date=2026-11-03`, method: 'PATCH' },
    ]);
    await waitFor(() =>
      expect(
        result.current.events.data
          ?.map(({ id, title, startDate }) => [id, title, startDate])
          .sort(([left], [right]) => String(left).localeCompare(String(right))),
      ).toEqual([
        ['a', 'Holiday', '2026-11-04'],
        ['b', 'b', '2026-11-10'],
      ]),
    );
    expect(await screen.findByText(CALENDAR_COPY.eventUpdated('Holiday'))).toBeInTheDocument();
  });

  it('takes an event out of the window when it moves out of it', async () => {
    seedFakeEvents([allDay('a', '2026-11-03')]);
    const { result } = await mounted();
    await waitFor(() => expect(result.current.events.data).toHaveLength(1));

    await act(async () => {
      await result.current.mutations.updateEvent.mutateAsync({
        id: 'a',
        date: '2026-11-03',
        body: body('a', '2027-02-01'),
      });
    });

    await waitFor(() => expect(result.current.events.data).toEqual([]));
  });

  it('deletes at the current start date and drops the event from the window', async () => {
    seedFakeEvents([allDay('a', '2026-11-03'), allDay('b', '2026-11-10')]);
    const { result, apiFetch } = await mounted();
    await waitFor(() => expect(result.current.events.data).toHaveLength(2));

    await act(async () => {
      await result.current.mutations.deleteEvent.mutateAsync({
        id: 'a',
        date: '2026-11-03',
        title: 'Trip',
      });
    });

    expect(writes(apiFetch)).toEqual([
      { path: `${EVENTS_PATH}/a?date=2026-11-03`, method: 'DELETE' },
    ]);
    await waitFor(() => expect(result.current.events.data?.map(({ id }) => id)).toEqual(['b']));
    expect(await screen.findByText(CALENDAR_COPY.eventDeleted('Trip'))).toBeInTheDocument();
  });

  it('says so and keeps the window as it was when a save fails', async () => {
    const { result } = await mounted({ failMethod: 'POST' });
    await waitFor(() => expect(result.current.events.data).toEqual([]));

    await act(async () => {
      await result.current.mutations.createEvent.mutateAsync({
        body: body('Picnic', '2026-11-20'),
      });
    });

    expect(result.current.events.data).toEqual([]);
    expect(await screen.findByText(CALENDAR_COPY.eventAddFailed('Picnic'))).toBeInTheDocument();
  });
});
