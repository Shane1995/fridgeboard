import type { IListItem } from '@fridgeboard/contract/lists';
import type { Bucket } from '../../services/shoppingList/types';
import { toBucket } from '../../services/shoppingList/utils/toBucket';
import { fakeShoppingListApi } from '../fakeShoppingListApi';
import { TEST_HOUSEHOLD_ID } from './constants';
import type { AddFakeBucket, AddFakeItem, UpdateFakeItem } from './types';

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
  addItem: ({ name, bucketId }: AddFakeItem): Promise<IListItem> =>
    call({ path: '/items', method: 'POST', body: { name, bucketId } }),
  updateItem: ({ id, changes }: UpdateFakeItem): Promise<IListItem> =>
    call({ path: `/items/${id}`, method: 'PATCH', body: changes }),
  listItems: async (): Promise<IListItem[]> => (await call({ path: '/items' })).items,
  createBucket: async ({ name, color }: AddFakeBucket): Promise<Bucket> =>
    toBucket(await call({ path: '/buckets', method: 'POST', body: { name, color } })),
  listBuckets: async (): Promise<Bucket[]> =>
    (await call({ path: '/buckets' })).buckets.map(toBucket),
};
