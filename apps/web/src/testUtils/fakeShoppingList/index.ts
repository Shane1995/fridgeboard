import type { IListItem } from '@fridgeboard/contract/lists';
import type { Shop } from '../../services/shoppingList/types';
import { toShop } from '../../services/shoppingList/utils/toShop';
import { fakeShoppingListApi } from '../fakeShoppingListApi';
import { TEST_HOUSEHOLD_ID } from './constants';
import type { AddFakeShop, AddFakeItem, UpdateFakeItem } from './types';

const BASE = `/api/v1/households/${TEST_HOUSEHOLD_ID}/lists/main`;

const call = async ({ path, method, body }: { path: string; method?: string; body?: unknown }) =>
  (
    await fakeShoppingListApi(
      { path: `${BASE}${path}`, timeoutMs: 1_000 },
      {
        ...(method === undefined ? {} : { method }),
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      },
    )
  ).json();

export const fakeShoppingList = {
  addItem: ({ name, shopId }: AddFakeItem): Promise<IListItem> =>
    call({ path: '/items', method: 'POST', body: { name, shopId } }),
  updateItem: ({ id, changes }: UpdateFakeItem): Promise<IListItem> =>
    call({ path: `/items/${id}`, method: 'PATCH', body: changes }),
  listItems: async (): Promise<IListItem[]> => (await call({ path: '/items' })).items,
  createShop: async ({ name, color }: AddFakeShop): Promise<Shop> =>
    toShop(await call({ path: '/shops', method: 'POST', body: { name, color } })),
  listShops: async (): Promise<Shop[]> => (await call({ path: '/shops' })).shops.map(toShop),
};
