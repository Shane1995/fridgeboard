import { deleteRuleOp } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import {
  buildHouseholdContext,
  TEST_HOUSEHOLD_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { removeRule } from './index.ts';

const getRule = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/rules/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/rules/index.ts')>()),
  getRule,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const call = () => removeRule(buildHouseholdContext({ pathParameters: { ruleId: 'r-1' } }));

describe('removeRule', () => {
  beforeEach(() => {
    getRule.mockReset().mockResolvedValue({ id: 'r-1' });
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('deletes the rule and answers 204', async () => {
    const result = await call();

    expect(result).toEqual({ statusCode: 204 });
    expect(recordChange).toHaveBeenCalledWith({
      table: expect.anything(),
      householdId: 'hh-1',
      changes: [{ type: 'event', id: 'r-1' }],
      items: [deleteRuleOp({ scope: TEST_HOUSEHOLD_SCOPE, ruleId: 'r-1' })],
    });
  });

  it('answers 404 for an unknown rule', async () => {
    getRule.mockResolvedValue(undefined);

    const result = await call();

    expect(result.statusCode).toBe(404);
    expect(recordChange).not.toHaveBeenCalled();
  });
});
