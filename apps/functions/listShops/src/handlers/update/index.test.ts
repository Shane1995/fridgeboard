import {
  buildListContext,
  TEST_SCOPE,
} from '@fridgeboard/lambda-kit/testUtils/buildListContext/index.ts';
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { updateShopOp } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { updateListShop } from './index.ts';

const getShop = vi.hoisted(() => vi.fn());
const recordChange = vi.hoisted(() => vi.fn());
vi.mock('@fridgeboard/lambda-kit/repository/shops/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@fridgeboard/lambda-kit/repository/shops/index.ts')>()),
  getShop,
}));
vi.mock('@fridgeboard/lambda-kit/utils/recordChange/index.ts', () => ({ recordChange }));

const CURRENT = { id: 'a', name: 'Aldi', color: 'sky', order: 1 };
const contextFor = (body: unknown) => buildListContext({ body, pathParameters: { shopId: 'a' } });

describe('updateListShop', () => {
  beforeEach(() => {
    getShop.mockReset().mockResolvedValue(CURRENT);
    recordChange.mockReset().mockResolvedValue([]);
  });

  it('renames and recolours the shop and answers with it', async () => {
    const context = contextFor({ name: ' Lidl ', color: 'mint' });

    const result = await updateListShop(context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? '')).toEqual({
      id: 'a',
      name: 'Lidl',
      color: 'mint',
      order: 1,
    });
    expect(recordChange).toHaveBeenCalledWith({
      table: context.table,
      householdId: 'hh-1',
      changes: [{ type: 'shop', id: 'a' }],
      items: [
        updateShopOp({ scope: TEST_SCOPE, shopId: 'a', set: { name: 'Lidl', color: 'mint' } }),
      ],
    });
  });

  it('changes only the fields it is given', async () => {
    await updateListShop(contextFor({ color: 'mint' }));

    expect(recordChange.mock.calls[0]?.[0].items).toEqual([
      updateShopOp({ scope: TEST_SCOPE, shopId: 'a', set: { color: 'mint' } }),
    ]);
  });

  it('answers 404 when there is no such shop', async () => {
    getShop.mockResolvedValue(undefined);

    const result = await updateListShop(contextFor({ name: 'Lidl' }));

    expect(result.statusCode).toBe(404);
    expect(recordChange).not.toHaveBeenCalled();
  });

  it.each([
    ['an empty patch', {}, 'invalid-request'],
    ['a blank name', { name: ' ' }, 'invalid-name'],
    ['an unknown color', { color: 'beige' }, 'invalid-color'],
  ])('refuses %s', async (_name, body, reason) => {
    const result = await updateListShop(contextFor(body));

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toEqual({ reason });
    expect(recordChange).not.toHaveBeenCalled();
  });

  it('answers 404 when the shop was deleted before the write', async () => {
    recordChange.mockRejectedValue(
      new TransactionCanceledException({
        message: 'cancelled',
        $metadata: {},
        CancellationReasons: [{ Code: 'ConditionalCheckFailed' }],
      }),
    );

    const result = await updateListShop(contextFor({ name: 'Lidl' }));

    expect(result.statusCode).toBe(404);
  });

  it('rethrows any other failure', async () => {
    recordChange.mockRejectedValue(new Error('boom'));

    await expect(updateListShop(contextFor({ name: 'Lidl' }))).rejects.toThrow('boom');
  });
});
