import type { IListItem } from '@fridgeboard/contract/lists';
import type * as z from 'zod/mini';
import type { ListItemSchema } from '../../../../utils/items/listItem/index.ts';

export const toListItem = ({
  id,
  name,
  shopId,
  checked,
  createdAt,
  addedBy,
}: z.infer<typeof ListItemSchema>): IListItem => ({
  id,
  name,
  shopId,
  checked,
  createdAt,
  addedBy,
});
