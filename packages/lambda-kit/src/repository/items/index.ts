import { ListItemSchema } from '../../utils/items/listItem/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../utils/keys/constants.ts';
import { itemKey } from '../../utils/keys/itemKey/index.ts';
import { itemPrefix } from '../../utils/keys/itemPrefix/index.ts';
import type { TransactType } from '../../utils/table/types.ts';
import { EXISTS_CONDITION } from '../constants.ts';
import type {
  GetItemOptions,
  ItemOpOptions,
  ListItemRow,
  PutItemOpOptions,
  QueryItemsOptions,
  SetItemShopsOpOptions,
  UpdateItemOpOptions,
} from './types.ts';

export const queryItems = ({
  table,
  scope: { householdId, listId },
}: QueryItemsOptions): Promise<ListItemRow[]> =>
  table.query(
    {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
        ':prefix': itemPrefix(listId),
      },
    },
    ListItemSchema,
  );

export const getItem = ({
  table,
  scope,
  itemId,
}: GetItemOptions): Promise<ListItemRow | undefined> =>
  table.get(itemKey({ ...scope, itemId }), ListItemSchema);

export const putItemOp = ({ scope, item }: PutItemOpOptions): TransactType => ({
  put: { ...itemKey({ ...scope, itemId: item.id }), ...item },
});

export const updateItemOp = ({ scope, itemId, set }: UpdateItemOpOptions): TransactType => ({
  update: itemKey({ ...scope, itemId }),
  parts: { set },
  condition: { expression: EXISTS_CONDITION },
});

export const setItemShopsOp = ({
  scope,
  itemId,
  shopIds,
}: SetItemShopsOpOptions): TransactType => ({
  update: itemKey({ ...scope, itemId }),
  parts: { set: { shopIds } },
});

export const deleteItemOp = ({ scope, itemId }: ItemOpOptions): TransactType => ({
  delete: itemKey({ ...scope, itemId }),
});
