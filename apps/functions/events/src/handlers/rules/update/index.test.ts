import type { IEventRule } from '@fridgeboard/contract/events';
import { putRuleOp } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import {
  buildHouseholdContext,
  TEST_HOUSEHOLD_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { updateRule } from './index.ts';

const getRule = vi.hoisted(() => vi.fn());
const isMember = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/rules/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/rules/index.ts')>()),
  getRule,
}));
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const current: IEventRule = {
  id: 'r-1',
  title: 'Recycling',
  note: '',
  ownerId: 'household',
  allDay: true,
  startDate: '2026-11-12',
  frequency: 'weekly',
  interval: 2,
  weekdays: [4],
  skip: ['2026-11-26'],
};

const call = (body: unknown) =>
  updateRule(buildHouseholdContext({ body, pathParameters: { ruleId: 'r-1' } }));

describe('updateRule', () => {
  beforeEach(() => {
    getRule.mockReset().mockResolvedValue(current);
    isMember.mockReset().mockResolvedValue(true);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('merges the changed fields and keeps the skipped dates', async () => {
    const result = await call({ title: 'Paper', interval: 4 });

    const rule = { ...current, title: 'Paper', interval: 4 };
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual(rule);
    expect(recordChange).toHaveBeenCalledWith({
      table: expect.anything(),
      householdId: 'hh-1',
      changes: [{ type: 'event', id: 'r-1' }],
      items: [putRuleOp({ scope: TEST_HOUSEHOLD_SCOPE, rule })],
    });
    expect(isMember).not.toHaveBeenCalled();
  });

  it('checks membership when the owner changes', async () => {
    isMember.mockResolvedValue(false);

    const result = await call({ ownerId: 'sub-9' });

    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-owner' });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('answers 404 for an unknown rule', async () => {
    getRule.mockResolvedValue(undefined);

    const result = await call({ title: 'Paper' });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-found' });
  });

  it.each([
    ['nope', 'invalid-request'],
    [{}, 'invalid-request'],
    [{ interval: 0 }, 'invalid-rule'],
  ])('refuses the body %j with %s', async (body, reason) => {
    const result = await call(body);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason });
    expect(recordChange).not.toHaveBeenCalled();
  });
});
