import type { IEventRule } from '@fridgeboard/contract/events';
import { putRuleOp } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import {
  buildHouseholdContext,
  TEST_HOUSEHOLD_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { createRule } from './index.ts';

const queryRules = vi.hoisted(() => vi.fn());
const isMember = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/rules/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/rules/index.ts')>()),
  queryRules,
}));
vi.mock('@fridgeboard/lambda-kit/repository/households/isMember/index.ts', () => ({ isMember }));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));
vi.mock('@fridgeboard/lambda-kit/utils/newId/index.ts', () => ({ newId: () => 'r-new' }));

const bins = {
  title: 'General waste',
  ownerId: 'household',
  allDay: true,
  startDate: '2026-11-05',
  frequency: 'weekly',
  interval: 2,
  weekdays: [4],
  color: 'black',
  reminder: 360,
};

describe('createRule', () => {
  beforeEach(() => {
    queryRules.mockReset().mockResolvedValue([]);
    isMember.mockReset().mockResolvedValue(true);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('creates a rule and records one event change', async () => {
    const context = buildHouseholdContext({ body: bins });
    const rule: IEventRule = {
      id: 'r-new',
      title: 'General waste',
      note: '',
      ownerId: 'household',
      allDay: true,
      startDate: '2026-11-05',
      frequency: 'weekly',
      interval: 2,
      weekdays: [4],
      color: 'black',
      reminder: 360,
      skip: [],
    };

    const result = await createRule(context);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body ?? '')).toEqual(rule);
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'event', id: 'r-new' }],
      items: [putRuleOp({ scope: TEST_HOUSEHOLD_SCOPE, rule })],
    });
    expect(isMember).not.toHaveBeenCalled();
  });

  it('refuses a 51st rule', async () => {
    queryRules.mockResolvedValue(Array.from({ length: 50 }, (_, index) => ({ id: `r-${index}` })));

    const result = await createRule(buildHouseholdContext({ body: bins }));

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'too-many-rules' });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('refuses an owner who is not a member', async () => {
    isMember.mockResolvedValue(false);

    const result = await createRule(buildHouseholdContext({ body: { ...bins, ownerId: 'sub-9' } }));

    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-owner' });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each([
    ['nope', 'invalid-request'],
    [{ ...bins, frequency: 'yearly' }, 'invalid-rule'],
    [{ ...bins, startDate: 'soon' }, 'invalid-date'],
  ])('refuses the body %j with %s', async (body, reason) => {
    const result = await createRule(buildHouseholdContext({ body }));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason });
    expect(recordChange).not.toHaveBeenCalled();
  });
});
