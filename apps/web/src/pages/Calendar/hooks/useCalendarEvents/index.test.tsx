import type { IEvent } from '@fridgeboard/contract/events';
import { waitFor } from '@testing-library/react';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { renderHookWithHousehold } from '../../../../testUtils/createShoppingListWrapper';
import { resetFakeEvents, seedFakeEvents } from '../../../../testUtils/fakeEventsApi';
import { useCalendarEvents } from '.';

const WINDOW = { from: '2026-11-01', to: '2026-12-12' };

const server: IEvent = {
  id: 'e-1',
  title: 'From the server',
  note: '',
  ownerId: 'household',
  eventType: 'event',
  allDay: true,
  startDate: '2026-11-03',
  endDate: '2026-11-03',
};

const eventRequests = (apiFetch: { mock: { calls: unknown[][] } }) =>
  apiFetch.mock.calls.filter(([endpoint]) =>
    (endpoint as { path: string }).path.includes('/events'),
  );

describe('useCalendarEvents', () => {
  beforeEach(() => {
    resetFakeEvents();
    seedFakeEvents([server]);
  });

  it('keeps the local dummy events and makes no request while the API flag is off', async () => {
    const { result, apiFetch } = await renderHookWithHousehold(() => useCalendarEvents(WINDOW));

    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.events.some(({ title }) => title === server.title)).toBe(false);
    expect(eventRequests(apiFetch)).toHaveLength(0);
  });

  it('reads the events from the server while the API flag is on', async () => {
    const { result, apiFetch } = await renderHookWithHousehold(() => useCalendarEvents(WINDOW), {
      flags: { [WebFeatureFlag.ENABLE_CALENDAR_API]: true },
    });

    await waitFor(() =>
      expect(result.current.events.map(({ title }) => title)).toEqual([server.title]),
    );
    expect(eventRequests(apiFetch)).toHaveLength(1);
  });

  it('is never loading while the API flag is off', async () => {
    const { result } = await renderHookWithHousehold(() => useCalendarEvents(WINDOW));

    expect(result.current.isLoading).toBe(false);
  });

  it('is loading until the server has answered while the API flag is on', async () => {
    const { result } = await renderHookWithHousehold(() => useCalendarEvents(WINDOW), {
      flags: { [WebFeatureFlag.ENABLE_CALENDAR_API]: true },
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events).toHaveLength(1);
  });
});
