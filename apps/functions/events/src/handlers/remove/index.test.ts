import { deleteEventOp } from '@fridgeboard/lambda-kit/repository/events/index.ts';
import {
  buildHouseholdContext,
  TEST_HOUSEHOLD_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { removeEvent } from './index.ts';

const getEvent = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/events/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/events/index.ts')>()),
  getEvent,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const call = (date: string | null = '2026-11-03') =>
  removeEvent(
    buildHouseholdContext({
      pathParameters: { eventId: 'e-1' },
      ...(date === null ? {} : { query: { date } }),
    }),
  );

describe('removeEvent', () => {
  beforeEach(() => {
    getEvent.mockReset().mockResolvedValue({ id: 'e-1', startDate: '2026-11-03' });
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('deletes the event and answers 204', async () => {
    const result = await call();

    expect(result).toEqual({ statusCode: 204 });
    expect(recordChange).toHaveBeenCalledWith({
      table: expect.anything(),
      householdId: 'hh-1',
      changes: [{ type: 'event', id: 'e-1' }],
      items: [
        deleteEventOp({ scope: TEST_HOUSEHOLD_SCOPE, startDate: '2026-11-03', eventId: 'e-1' }),
      ],
    });
  });

  it('answers 404 when the event is not at that date', async () => {
    getEvent.mockResolvedValue(undefined);

    const result = await call();

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-found' });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each([[null], ['x'], ['2026-02-30']])('refuses the date %j', async (date) => {
    const result = await call(date);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-date' });
    expect(getEvent).not.toHaveBeenCalled();
  });
});
