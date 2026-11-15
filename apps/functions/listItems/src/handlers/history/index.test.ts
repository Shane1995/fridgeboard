import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { listHistory } from './index.ts';

const queryHistory = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/history/index.ts', () => ({ queryHistory }));

describe('listHistory', () => {
  beforeEach(() => {
    queryHistory.mockReset();
  });

  it('lists the most used names first and fills in a missing shop list', async () => {
    queryHistory.mockResolvedValue([
      { name: 'Eggs', count: 2 },
      { name: 'Milk', shopIds: ['s1'], count: 5 },
    ]);

    const result = await listHistory(buildListContext());

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({
      entries: [
        { name: 'Milk', shopIds: ['s1'], count: 5 },
        { name: 'Eggs', shopIds: [], count: 2 },
      ],
    });
    expect(queryHistory).toHaveBeenCalledWith(expect.objectContaining({ scope: TEST_SCOPE }));
  });
});
