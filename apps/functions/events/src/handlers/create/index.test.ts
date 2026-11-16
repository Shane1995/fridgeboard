import { putEventOp } from '@fridgeboard/lambda-kit/repository/events/index.ts';
import {
  buildHouseholdContext,
  TEST_HOUSEHOLD_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { createEvent } from './index.ts';

const isMember = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));
vi.mock('@fridgeboard/lambda-kit/utils/newId/index.ts', () => ({ newId: () => 'e-new' }));

const timedBody = {
  title: ' Late shift ',
  ownerId: 'sub-2',
  allDay: false,
  startsAt: '2026-07-01T23:30:00Z',
  endsAt: '2026-07-02T05:00:00Z',
};

describe('createEvent', () => {
  beforeEach(() => {
    isMember.mockReset().mockResolvedValue(true);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('creates a timed event and records one event change', async () => {
    const context = buildHouseholdContext({ body: timedBody });
    const event = {
      id: 'e-new',
      title: 'Late shift',
      note: '',
      ownerId: 'sub-2',
      eventType: 'event',
      allDay: false,
      startDate: '2026-07-02',
      endDate: '2026-07-02',
      startsAt: '2026-07-01T23:30:00Z',
      endsAt: '2026-07-02T05:00:00Z',
    } as const;

    const result = await createEvent(context);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body ?? '')).toEqual(event);
    expect(isMember).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      sub: 'sub-2',
    });
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'event', id: 'e-new' }],
      items: [putEventOp({ scope: TEST_HOUSEHOLD_SCOPE, event })],
    });
  });

  it('accepts the household as owner without a membership read', async () => {
    const result = await createEvent(
      buildHouseholdContext({
        body: {
          title: 'Bins',
          ownerId: 'household',
          allDay: true,
          startDate: '2026-11-03',
          endDate: '2026-11-03',
        },
      }),
    );

    expect(result.statusCode).toBe(201);
    expect(isMember).not.toHaveBeenCalled();
  });

  it('refuses an owner who is not a member', async () => {
    isMember.mockResolvedValue(false);

    const result = await createEvent(buildHouseholdContext({ body: timedBody }));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-owner' });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each([
    ['nope', 'invalid-request'],
    [{ ...timedBody, title: undefined }, 'invalid-title'],
    [{ ...timedBody, endsAt: '2026-07-01T10:00:00Z' }, 'invalid-time'],
  ])('refuses the body %j with %s and writes nothing', async (body, reason) => {
    const result = await createEvent(buildHouseholdContext({ body }));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason });
    expect(recordChange).not.toHaveBeenCalled();
  });
});
