import type {
  IBucket,
  IBucketsResponse,
  IHistoryResponse,
  IListItem,
  IListItemsResponse,
} from '@fridgeboard/contract/lists';
import { getJson } from '../../api/getJson';
import { resolveEndpoint } from '../../configuration/resolveEndpoint';
import { WebService } from '../../configuration/schema/constants';
import { POST } from '../../session/constants';
import type { ShoppingListRepository } from '../types';
import { DELETE, PATCH, PUT } from './constants';
import type { ApiRepositoryOptions } from './types';
import { toBucket } from './utils/toBucket';
import { toListItem } from './utils/toListItem';
import { writeJson } from './utils/writeJson';

export const createApiShoppingListRepository = ({
  householdId,
  listId,
  api,
  readTimeoutMs,
  writeTimeoutMs,
  fetcher,
}: ApiRepositoryOptions): ShoppingListRepository => {
  const read = <TData>({ service }: { service: WebService }) =>
    getJson<TData>(
      resolveEndpoint({
        api,
        service,
        timeoutMs: readTimeoutMs,
        params: { householdId, listId },
      }),
      fetcher,
    );

  const write = <TData>({
    service,
    method,
    body,
    params = {},
  }: {
    service: WebService;
    method: string;
    body?: unknown;
    params?: Record<string, string>;
  }) =>
    writeJson<TData>({
      endpoint: resolveEndpoint({
        api,
        service,
        timeoutMs: writeTimeoutMs,
        params: { householdId, listId, ...params },
      }),
      method,
      body,
      fetcher,
    });

  const listItems = async () =>
    (await read<IListItemsResponse>({ service: WebService.listItems })).items.map(toListItem);

  return {
    listBuckets: async () =>
      (await read<IBucketsResponse>({ service: WebService.listBuckets })).buckets.map(toBucket),

    createBucket: async ({ name, color }) =>
      toBucket(
        await write<IBucket>({
          service: WebService.listBuckets,
          method: POST,
          body: { name, color },
        }),
      ),

    updateBucket: async ({ id, changes }) =>
      toBucket(
        await write<IBucket>({
          service: WebService.listBucket,
          method: PATCH,
          body: changes,
          params: { bucketId: id },
        }),
      ),

    deleteBucket: async ({ id }) => {
      await write<void>({
        service: WebService.listBucket,
        method: DELETE,
        params: { bucketId: id },
      });
    },

    reorderBuckets: async ({ ids }) =>
      (
        await write<IBucketsResponse>({
          service: WebService.listBucketsOrder,
          method: PUT,
          body: { ids },
        })
      ).buckets.map(toBucket),

    listItems,

    addItem: async ({ name, bucketId }) =>
      toListItem(
        await write<IListItem>({
          service: WebService.listItems,
          method: POST,
          body: { name, bucketId },
        }),
      ),

    updateItem: async ({ id, changes }) =>
      toListItem(
        await write<IListItem>({
          service: WebService.listItem,
          method: PATCH,
          body: changes,
          params: { itemId: id },
        }),
      ),

    deleteItem: async ({ id }) => {
      await write<void>({
        service: WebService.listItem,
        method: DELETE,
        params: { itemId: id },
      });
    },

    clearChecked: async () => {
      const items = await listItems();
      await Promise.all(
        items
          .filter(({ checked }) => checked)
          .map(({ id }) =>
            write<void>({
              service: WebService.listItem,
              method: DELETE,
              params: { itemId: id },
            }),
          ),
      );
    },

    history: async () =>
      (await read<IHistoryResponse>({ service: WebService.listHistory })).entries,
  };
};
