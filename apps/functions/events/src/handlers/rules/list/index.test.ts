import { buildHouseholdContext } from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { listRules } from './index.ts';

const queryRules = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/rules/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/rules/index.ts')>()),
  queryRules,
}));

describe('listRules', () => {
  it('answers the household’s rules', async () => {
    const rules = [{ id: 'r-1', title: 'Recycling' }];
    queryRules.mockReset().mockResolvedValue(rules);

    const result = await listRules(buildHouseholdContext());

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({ rules });
  });
});
