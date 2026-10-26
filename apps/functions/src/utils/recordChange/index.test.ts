import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createTable } from '../table/index.ts';
import { recordChange } from './index.ts';

const commitChange = vi.hoisted(() => vi.fn());
const publishChange = vi.hoisted(() => vi.fn());
vi.mock('../commitChange/index.ts', () => ({ commitChange }));
vi.mock('../publishChange/index.ts', () => ({ publishChange }));

const CHANGE = { id: 'abc', rev: 3, type: 'item' as const };
const OPTIONS = {
  table: createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard'),
  householdId: 'hh-1',
  type: 'item' as const,
  id: 'abc',
  items: [],
};

describe('recordChange', () => {
  beforeEach(() => {
    commitChange.mockReset().mockResolvedValue(CHANGE);
    publishChange.mockReset().mockResolvedValue(undefined);
  });

  it('commits the change and then announces it to the household', async () => {
    const change = await recordChange(OPTIONS);

    expect(change).toEqual(CHANGE);
    expect(commitChange).toHaveBeenCalledWith(OPTIONS);
    expect(publishChange).toHaveBeenCalledWith({ householdId: 'hh-1', change: CHANGE });
  });

  it('announces nothing when the commit fails', async () => {
    commitChange.mockRejectedValue(new Error('REV_CONFLICT'));

    await expect(recordChange(OPTIONS)).rejects.toThrow('REV_CONFLICT');
    expect(publishChange).not.toHaveBeenCalled();
  });
});
