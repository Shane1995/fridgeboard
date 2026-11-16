import type { IEventRule } from '@fridgeboard/contract/events';
import { putRuleOp } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import {
  buildHouseholdContext,
  TEST_HOUSEHOLD_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildHouseholdContext/index.ts';
import { skipOccurrence } from './index.ts';

const getRule = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/rules/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/rules/index.ts')>()),
  getRule,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

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
  skip: ['2026-12-03'],
};

const call = (date: string) =>
  skipOccurrence(buildHouseholdContext({ pathParameters: { ruleId: 'r-1', date } }));

describe('skipOccurrence', () => {
  beforeEach(() => {
    getRule.mockReset().mockResolvedValue(rule);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('adds the date to the skipped dates, in order', async () => {
    const result = await call('2026-11-19');

    expect(result).toEqual({ statusCode: 204 });
    expect(recordChange).toHaveBeenCalledWith({
      table: expect.anything(),
      householdId: 'hh-1',
      changes: [{ type: 'event', id: 'r-1' }],
      items: [
        putRuleOp({
          scope: TEST_HOUSEHOLD_SCOPE,
          rule: { ...rule, skip: ['2026-11-19', '2026-12-03'] },
        }),
      ],
    });
  });

  it.each(['2026-11-12', '2026-12-03'])(
    'answers 404 for %s, which is not an occurrence',
    async (date) => {
      const result = await call(date);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'not-found' });
      expect(recordChange).not.toHaveBeenCalled();
    },
  );

  it('answers 404 for an unknown rule', async () => {
    getRule.mockResolvedValue(undefined);

    expect((await call('2026-11-19')).statusCode).toBe(404);
  });

  it.each(['soon', '2026-02-30'])('refuses the date %j', async (date) => {
    const result = await call(date);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'invalid-date' });
    expect(getRule).not.toHaveBeenCalled();
  });

  it('refuses a 201st skipped date', async () => {
    getRule.mockResolvedValue({
      ...rule,
      skip: Array.from({ length: 200 }, (_, index) => `2020-01-${index}`),
    });

    const result = await call('2026-11-19');

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason: 'too-many-skips' });
  });
});
