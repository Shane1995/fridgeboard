import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { deleteItemOp } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { removeListItem } from './index.ts';

const getItem = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/items/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/items/index.ts')>()),
  getItem,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const context = buildListContext({ pathParameters: { itemId: 'i1' } });

describe('removeListItem', () => {
  beforeEach(() => {
    getItem.mockReset();
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('deletes the item and records the change', async () => {
    getItem.mockResolvedValue({ id: 'i1' });

    const result = await removeListItem(context);

    expect(result).toEqual({ statusCode: 204 });
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'item', id: 'i1' }],
      items: [deleteItemOp({ scope: TEST_SCOPE, itemId: 'i1' })],
    });
  });

  it('answers 404 and records nothing when there is no such item', async () => {
    getItem.mockResolvedValue(undefined);

    const result = await removeListItem(context);

    expect(result.statusCode).toBe(404);
    expect(recordChange).not.toHaveBeenCalled();
  });
});
