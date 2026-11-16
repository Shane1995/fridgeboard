import type { IEvent, IEventsResponse } from '@fridgeboard/contract/events';
import { QueryClient } from '@tanstack/react-query';
import { QueryName } from '../../../../services/configuration/schema/constants';
import { patchEventWindows } from '.';

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

const NOVEMBER = { householdId: 'h', from: '2026-11-01', to: '2026-12-12' };
const JANUARY = { householdId: 'h', from: '2026-12-27', to: '2027-02-06' };

const seeded = () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData<IEventsResponse>([QueryName.events, NOVEMBER], {
    events: [event('a', '2026-11-03')],
  });
  queryClient.setQueryData<IEventsResponse>([QueryName.events, JANUARY], { events: [] });
  return queryClient;
};

const idsIn = (queryClient: QueryClient, window: typeof NOVEMBER) =>
  queryClient.getQueryData<IEventsResponse>([QueryName.events, window])?.events.map(({ id }) => id);

describe('patchEventWindows', () => {
  it('adds an event to the cached windows it overlaps only', () => {
    const queryClient = seeded();

    patchEventWindows({ queryClient, id: 'b', event: event('b', '2026-11-10') });

    expect(idsIn(queryClient, NOVEMBER)).toEqual(['a', 'b']);
    expect(idsIn(queryClient, JANUARY)).toEqual([]);
  });

  it('puts a multi-day event into every window it reaches', () => {
    const queryClient = seeded();

    patchEventWindows({
      queryClient,
      id: 'trip',
      event: event('trip', '2026-12-10', '2026-12-30'),
    });

    expect(idsIn(queryClient, NOVEMBER)).toEqual(['a', 'trip']);
    expect(idsIn(queryClient, JANUARY)).toEqual(['trip']);
  });

  it('replaces an event that is already there', () => {
    const queryClient = seeded();

    patchEventWindows({
      queryClient,
      id: 'a',
      event: { ...event('a', '2026-11-04'), title: 'New' },
    });

    expect(queryClient.getQueryData<IEventsResponse>([QueryName.events, NOVEMBER])?.events).toEqual(
      [{ ...event('a', '2026-11-04'), title: 'New' }],
    );
  });

  it('takes an event out of a window it has moved away from', () => {
    const queryClient = seeded();

    patchEventWindows({ queryClient, id: 'a', event: event('a', '2027-01-15') });

    expect(idsIn(queryClient, NOVEMBER)).toEqual([]);
    expect(idsIn(queryClient, JANUARY)).toEqual(['a']);
  });

  it('removes an event everywhere when no replacement is given', () => {
    const queryClient = seeded();

    patchEventWindows({ queryClient, id: 'a' });

    expect(idsIn(queryClient, NOVEMBER)).toEqual([]);
  });

  it('leaves windows that were never loaded alone', () => {
    const queryClient = new QueryClient();

    patchEventWindows({ queryClient, id: 'a', event: event('a', '2026-11-03') });

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
