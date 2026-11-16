import type { IEventRule } from '@fridgeboard/contract/events';
import { putEventOp } from '@fridgeboard/lambda-kit/repository/events/index.ts';
import { putRuleOp } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import {
  buildHouseholdContext,
  TEST_HOUSEHOLD_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { overrideOccurrence } from './index.ts';

const getRule = vi.hoisted(() => vi.fn());
const isMember = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/rules/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/rules/index.ts')>()),
  getRule,
}));
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));
vi.mock('@fridgeboard/lambda-kit/utils/newId/index.ts', () => ({ newId: () => 'e-new' }));

const rule: IEventRule = {
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
  color: 'black',
};

const call = (body: unknown, date = '2026-11-19') =>
  overrideOccurrence(buildHouseholdContext({ body, pathParameters: { ruleId: 'r-1', date } }));

describe('overrideOccurrence', () => {
  beforeEach(() => {
    getRule.mockReset().mockResolvedValue(rule);
    isMember.mockReset().mockResolvedValue(true);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('turns one date into its own event and skips it in the rule', async () => {
    const result = await call({ reminder: 60 });

    const event = {
      id: 'e-new',
      title: 'General waste',
      note: '',
      ownerId: 'household',
      eventType: 'event',
      allDay: true,
      startDate: '2026-11-19',
      endDate: '2026-11-19',
      color: 'black',
      reminder: 60,
    } as const;
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body ?? '')).toEqual(event);
    expect(recordChange).toHaveBeenCalledWith({
      table: expect.anything(),
      householdId: 'hh-1',
      changes: [{ type: 'event', id: 'e-new' }],
      items: [
        putEventOp({ scope: TEST_HOUSEHOLD_SCOPE, event }),
        putRuleOp({ scope: TEST_HOUSEHOLD_SCOPE, rule: { ...rule, skip: ['2026-11-19'] } }),
      ],
    });
  });

  it('lets the one-off move to another day', async () => {
    const result = await call({ startDate: '2026-11-20', endDate: '2026-11-20' });

    expect(JSON.parse(result.body ?? '')).toMatchObject({
      startDate: '2026-11-20',
      endDate: '2026-11-20',
    });
  });

  it('copies the occurrence when the body is empty', async () => {
    expect((await call({})).statusCode).toBe(201);
  });

  it('refuses a new owner who is not a member', async () => {
    isMember.mockResolvedValue(false);

    const result = await call({ ownerId: 'sub-9' });

    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-owner' });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each(['2026-11-12'])('answers 404 for %s, which is not an occurrence', async (date) => {
    const result = await call({}, date);

    expect(result.statusCode).toBe(404);
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('answers 404 for an unknown rule and 400 for a bad date', async () => {
    getRule.mockResolvedValue(undefined);

    expect((await call({})).statusCode).toBe(404);
    expect((await call({}, 'soon')).statusCode).toBe(400);
  });

  it('refuses a body that is invalid for an event', async () => {
    const result = await call({ title: ' ' });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-title' });
  });
});
