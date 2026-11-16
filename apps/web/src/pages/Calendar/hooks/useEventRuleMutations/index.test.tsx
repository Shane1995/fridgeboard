import { act, screen, waitFor } from '@testing-library/react';
import { useEventsQuery } from '../../../../hooks/useEventsQuery';
import { renderHookWithHousehold } from '../../../../testUtils/createShoppingListWrapper';
import { resetFakeEvents } from '../../../../testUtils/fakeEventsApi';
import { CALENDAR_COPY } from '../../constants';
import { useEventRuleMutations } from '.';

const WINDOW = { from: '2026-11-01', to: '2026-12-05' };
const BASE = '/api/v1/households/hh-1';

const mounted = async (options?: Parameters<typeof renderHookWithHousehold>[1]) => {
  const rendered = await renderHookWithHousehold(
    () => ({ rules: useEventRuleMutations(), events: useEventsQuery(WINDOW) }),
    options,
  );
  await waitFor(() => expect(rendered.result.current.events.data).toEqual([]));
  return rendered;
};

const requests = (apiFetch: { mock: { calls: unknown[][] } }) =>
  apiFetch.mock.calls
    .map(([endpoint, init]) => ({
      path: (endpoint as { path: string }).path,
      method: (init as RequestInit | undefined)?.method ?? 'GET',
      body: (init as RequestInit | undefined)?.body,
    }))
    .filter(({ path }) => path.startsWith(`${BASE}/event`));

const windowReads = (apiFetch: { mock: { calls: unknown[][] } }) =>
  requests(apiFetch).filter(({ path, method }) => method === 'GET' && path.includes('?from='));

describe('useEventRuleMutations', () => {
  beforeEach(() => {
    resetFakeEvents();
  });

  it('starts a series and reads the month again, since new days appear in it', async () => {
    const { result, apiFetch } = await mounted();
    const before = windowReads(apiFetch).length;

    await act(async () => {
      await result.current.rules.createRule.mutateAsync({
        title: 'General waste',
        body: {
          title: 'General waste',
          ownerId: 'household',
          allDay: true,
          startDate: '2026-11-05',
          frequency: 'weekly',
          interval: 2,
          weekdays: [4],
        },
      });
    });

    await waitFor(() => expect(windowReads(apiFetch).length).toBe(before + 1));
    expect(requests(apiFetch).find(({ method }) => method === 'POST')).toMatchObject({
      path: `${BASE}/event-rules`,
    });
    expect(await screen.findByText(CALENDAR_COPY.eventAdded('General waste'))).toBeInTheDocument();
  });

  it('changes every occurrence with one patch to the rule', async () => {
    const { result, apiFetch } = await mounted();

    await act(async () => {
      await result.current.rules.updateRule.mutateAsync({
        ruleId: 'rule-1',
        title: 'Recycling',
        body: { title: 'Recycling' },
      });
    });

    expect(requests(apiFetch).find(({ method }) => method === 'PATCH')).toMatchObject({
      path: `${BASE}/event-rules/rule-1`,
    });
    expect(await screen.findByText(CALENDAR_COPY.eventUpdated('Recycling'))).toBeInTheDocument();
  });

  it('deletes the whole series with one request', async () => {
    const { result, apiFetch } = await mounted();

    await act(async () => {
      await result.current.rules.deleteRule.mutateAsync({ ruleId: 'rule-1', title: 'Recycling' });
    });

    expect(requests(apiFetch).find(({ method }) => method === 'DELETE')).toMatchObject({
      path: `${BASE}/event-rules/rule-1`,
    });
    expect(await screen.findByText(CALENDAR_COPY.eventDeleted('Recycling'))).toBeInTheDocument();
  });

  it('skips one day of a series', async () => {
    const { result, apiFetch } = await mounted();

    await act(async () => {
      await result.current.rules.skipOccurrence.mutateAsync({
        ruleId: 'rule-1',
        date: '2026-11-12',
        title: 'Recycling',
      });
    });

    expect(requests(apiFetch).find(({ method }) => method === 'DELETE')).toMatchObject({
      path: `${BASE}/event-rules/rule-1/occurrences/2026-11-12`,
    });
    expect(
      await screen.findByText(CALENDAR_COPY.occurrenceSkipped('Recycling')),
    ).toBeInTheDocument();
  });

  it('turns one day of a series into an event of its own with the changes', async () => {
    const { result, apiFetch } = await mounted();

    await act(async () => {
      await result.current.rules.overrideOccurrence.mutateAsync({
        ruleId: 'rule-1',
        date: '2026-11-12',
        title: 'Recycling (moved)',
        body: { title: 'Recycling (moved)' },
      });
    });

    expect(requests(apiFetch).find(({ method }) => method === 'POST')).toMatchObject({
      path: `${BASE}/event-rules/rule-1/occurrences/2026-11-12`,
      body: JSON.stringify({ title: 'Recycling (moved)' }),
    });
  });

  it('says so when starting a series fails', async () => {
    const { result } = await mounted({ failMethod: 'POST' });

    await act(async () => {
      await result.current.rules.createRule.mutateAsync({
        title: 'General waste',
        body: {
          title: 'General waste',
          ownerId: 'household',
          allDay: true,
          startDate: '2026-11-05',
          frequency: 'daily',
        },
      });
    });

    expect(
      await screen.findByText(CALENDAR_COPY.eventAddFailed('General waste')),
    ).toBeInTheDocument();
  });
});
