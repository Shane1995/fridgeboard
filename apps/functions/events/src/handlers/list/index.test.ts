import { buildHouseholdContext } from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { listEvents } from './index.ts';

const queryEvents = vi.hoisted(() => vi.fn());
const queryRules = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/events/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/events/index.ts')>()),
  queryEvents,
}));
vi.mock('@fridgeboard/lambda-kit/repository/rules/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/rules/index.ts')>()),
  queryRules,
}));

const event = {
  id: 'e-1',
  title: 'Trip',
  note: '',
  ownerId: 'household',
  eventType: 'event',
  allDay: true,
  startDate: '2026-11-03',
  endDate: '2026-11-05',
};

const bins = {
  id: 'r-1',
  title: 'General waste',
  note: '',
  ownerId: 'household',
  allDay: true,
  startDate: '2026-11-05',
  frequency: 'weekly',
  interval: 2,
  weekdays: [4],
  skip: [],
};

const november = { query: { from: '2026-11-01', to: '2026-11-30' } };

describe('listEvents', () => {
  beforeEach(() => {
    queryEvents.mockReset().mockResolvedValue([event]);
    queryRules.mockReset().mockResolvedValue([]);
  });

  it('answers the events in the window', async () => {
    const context = buildHouseholdContext(november);

    const result = await listEvents(context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ events: [event] });
    expect(queryEvents).toHaveBeenCalledWith({
      table: context.table,
      scope: { householdId: 'hh-1' },
      from: '2026-11-01',
      to: '2026-11-30',
    });
  });

  it('adds the occurrences of the household’s rules, sorted with the one-off events', async () => {
    queryRules.mockResolvedValue([bins]);

    const result = await listEvents(buildHouseholdContext(november));

    expect(JSON.parse(result.body ?? '').events.map(({ id }: { id: string }) => id)).toEqual([
      'e-1',
      'r-1_2026-11-05',
      'r-1_2026-11-19',
    ]);
  });

  it('includes an overnight occurrence that began the day before the window', async () => {
    queryRules.mockResolvedValue([
      {
        ...bins,
        allDay: false,
        startTime: '22:00',
        endTime: '02:00',
        frequency: 'daily',
        interval: 1,
        startDate: '2026-10-01',
      },
    ]);
    queryEvents.mockResolvedValue([]);

    const result = await listEvents(
      buildHouseholdContext({ query: { from: '2026-11-01', to: '2026-11-01' } }),
    );

    expect(JSON.parse(result.body ?? '').events.map(({ id }: { id: string }) => id)).toEqual([
      'r-1_2026-10-31',
      'r-1_2026-11-01',
    ]);
  });

  it('leaves out a rule that starts after the window', async () => {
    queryRules.mockResolvedValue([{ ...bins, startDate: '2026-12-03' }]);
    queryEvents.mockResolvedValue([]);

    const result = await listEvents(buildHouseholdContext(november));

    expect(JSON.parse(result.body ?? '')).toEqual({ events: [] });
  });

  it.each([
    [{ from: '2026-11-01', to: '2027-01-02' }],
    [{ from: '2026-11-30', to: '2026-11-01' }],
    [{ from: '2026-11-01' }],
    [undefined],
  ])('refuses the window %j', async (query) => {
    const result = await listEvents(buildHouseholdContext({ ...(query ? { query } : {}) }));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-window' });
    expect(queryEvents).not.toHaveBeenCalled();
    expect(queryRules).not.toHaveBeenCalled();
  });
});
