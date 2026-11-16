import { deleteEventOp, putEventOp } from '@fridgeboard/lambda-kit/repository/events/index.ts';
import {
  buildHouseholdContext,
  TEST_HOUSEHOLD_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { updateEvent } from './index.ts';

const getEvent = vi.hoisted(() => vi.fn());
const isMember = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/events/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/events/index.ts')>()),
  getEvent,
}));
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const current = {
  id: 'e-1',
  title: 'Trip',
  note: 'Pack',
  ownerId: 'household',
  eventType: 'event',
  allDay: true,
  startDate: '2026-11-03',
  endDate: '2026-11-05',
} as const;

const call = (body: unknown, date: string | null = '2026-11-03') =>
  updateEvent(
    buildHouseholdContext({
      body,
      pathParameters: { eventId: 'e-1' },
      ...(date === null ? {} : { query: { date } }),
    }),
  );

describe('updateEvent', () => {
  beforeEach(() => {
    getEvent.mockReset().mockResolvedValue(current);
    isMember.mockReset().mockResolvedValue(true);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('merges the changed fields', async () => {
    const result = await call({ title: 'Holiday' });

    const event = { ...current, title: 'Holiday' };
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual(event);
    expect(getEvent).toHaveBeenCalledWith({
      table: expect.anything(),
      scope: TEST_HOUSEHOLD_SCOPE,
      startDate: '2026-11-03',
      eventId: 'e-1',
    });
    expect(recordChange).toHaveBeenCalledWith({
      table: expect.anything(),
      householdId: 'hh-1',
      changes: [{ type: 'event', id: 'e-1' }],
      items: [putEventOp({ scope: TEST_HOUSEHOLD_SCOPE, event })],
    });
    expect(isMember).not.toHaveBeenCalled();
  });

  it('moves the item when the start date changes', async () => {
    const result = await call({ startDate: '2026-11-04', endDate: '2026-11-06' });

    const event = { ...current, startDate: '2026-11-04', endDate: '2026-11-06' };
    expect(result.statusCode).toBe(200);
    expect(recordChange).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          deleteEventOp({ scope: TEST_HOUSEHOLD_SCOPE, startDate: '2026-11-03', eventId: 'e-1' }),
          putEventOp({ scope: TEST_HOUSEHOLD_SCOPE, event }),
        ],
      }),
    );
  });

  it('checks membership only when the owner changes', async () => {
    isMember.mockResolvedValue(false);

    const result = await call({ ownerId: 'sub-9' });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-owner' });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('accepts a new owner who is a member', async () => {
    const result = await call({ ownerId: 'sub-9' });

    expect(result.statusCode).toBe(200);
    expect(isMember).toHaveBeenCalledWith({
      table: expect.anything(),
      householdId: 'hh-1',
      sub: 'sub-9',
    });
  });

  it('answers 404 for an unknown event or date', async () => {
    getEvent.mockResolvedValue(undefined);

    const result = await call({ title: 'Holiday' });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-found' });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each([[null], ['2026-02-30'], ['x']])(
    'refuses the date %j with invalid-date',
    async (date) => {
      const result = await call({ title: 'Holiday' }, date);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-date' });
      expect(getEvent).not.toHaveBeenCalled();
    },
  );

  it.each([['nope'], [{}], [{ title: '' }]])('refuses the body %j', async (body) => {
    const result = await call(body);

    expect(result.statusCode).toBe(400);
    expect(recordChange).not.toHaveBeenCalled();
  });
});
