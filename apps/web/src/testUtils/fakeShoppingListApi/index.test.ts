import { fakeShoppingListApi, resetFakeShoppingList } from './index';

const ITEMS = { path: '/api/v1/households/hh-1/lists/main/items', timeoutMs: 1_000 };

const listed = async () => (await (await fakeShoppingListApi(ITEMS)).json()).items;

describe('fakeShoppingListApi', () => {
  it('keeps what is added until it is reset', async () => {
    await fakeShoppingListApi(ITEMS, { method: 'POST', body: JSON.stringify({ name: 'Milk' }) });

    expect(await listed()).toHaveLength(1);

    resetFakeShoppingList();

    expect(await listed()).toEqual([]);
  });

  it('answers 404 for a path it does not serve', async () => {
    expect((await fakeShoppingListApi({ path: '/api/v1/other', timeoutMs: 1_000 })).status).toBe(
      404,
    );
  });
});
