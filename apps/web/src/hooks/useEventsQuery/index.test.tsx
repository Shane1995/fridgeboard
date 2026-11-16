import type { IEvent } from '@fridgeboard/contract/events';
import { waitFor } from '@testing-library/react';
import { resetFakeEvents, seedFakeEvents } from '../../testUtils/fakeEventsApi';
import { renderHookWithHousehold } from '../../testUtils/createShoppingListWrapper';
import { useEventsQuery } from '.';

const event = (id: string, startDate: string, endDate = startDate): IEvent => ({
  id,
  title: id,
  note: '',
  ownerId: 'household',
  eventType: 'event',
  allDay: true,
  startDate,
  endDate,
});

const EVENTS_PATH = '/api/v1/households/hh-1/events';

const eventPaths = (apiFetch: { mock: { calls: unknown[][] } }): string[] =>
  apiFetch.mock.calls
    .map(([endpoint]) => (endpoint as { path: string }).path)
    .filter((path) => path.startsWith(EVENTS_PATH));

describe('useEventsQuery', () => {
  beforeEach(() => {
    resetFakeEvents();
  });

  it('asks for one window and returns the events inside it', async () => {
    seedFakeEvents([event('a', '2026-11-03'), event('b', '2026-12-20')]);

    const { result, apiFetch } = await renderHookWithHousehold(() =>
      useEventsQuery({ from: '2026-11-01', to: '2026-12-12' }),
    );

    await waitFor(() => expect(result.current.data?.map(({ id }) => id)).toEqual(['a']));
    expect(eventPaths(apiFetch)).toEqual([`${EVENTS_PATH}?from=2026-11-01&to=2026-12-12`]);
  });

  it('does not ask again for a window it already has', async () => {
    seedFakeEvents([event('a', '2026-11-03')]);
    let window = { from: '2026-11-01', to: '2026-12-12' };
    const { result, rerender, apiFetch } = await renderHookWithHousehold(() =>
      useEventsQuery(window),
    );
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    window = { from: '2026-11-01', to: '2026-12-12' };
    rerender();

    expect(eventPaths(apiFetch)).toHaveLength(1);
  });

  it('asks once more for a different window and keeps each window apart', async () => {
    seedFakeEvents([event('a', '2026-11-03'), event('b', '2026-12-20')]);
    let window = { from: '2026-11-01', to: '2026-12-12' };
    const { result, rerender, apiFetch } = await renderHookWithHousehold(() =>
      useEventsQuery(window),
    );
    await waitFor(() => expect(result.current.data?.map(({ id }) => id)).toEqual(['a']));

    window = { from: '2026-12-13', to: '2027-01-23' };
    rerender();

    await waitFor(() => expect(result.current.data?.map(({ id }) => id)).toEqual(['b']));
    expect(eventPaths(apiFetch)).toHaveLength(2);
  });

  it('stays idle while it is switched off', async () => {
    const { result, apiFetch } = await renderHookWithHousehold(() =>
      useEventsQuery({ from: '2026-11-01', to: '2026-12-12', enabled: false }),
    );

    expect(result.current.data).toBeUndefined();
    expect(eventPaths(apiFetch)).toHaveLength(0);
  });
});
