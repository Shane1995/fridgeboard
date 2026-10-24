import { UNSORTED_SHOP_ID } from '@fridgeboard/contract/lists/constants';
import type { IListItem } from '@fridgeboard/contract/lists';
import type * as z from 'zod/mini';
import type { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { shopIdsOf } from '../../../../utils/shopIdsOf/index.ts';

export const toListItem = ({
  id,
  name,
  shopIds,
  shopId,
  checked,
  createdAt,
  addedBy,
}: z.infer<typeof ListItemSchema>): IListItem => {
  const shops = shopIdsOf({ shopIds, shopId });
  return {
    id,
    name,
    shopIds: shops,
    shopId: shops[0] ?? UNSORTED_SHOP_ID,
    checked,
    createdAt,
    addedBy,
  };
};
