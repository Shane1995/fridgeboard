import { HistoryItemSchema } from '../../utils/items/historyItem/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../utils/keys/constants.ts';
import { historyKey } from '../../utils/keys/historyKey/index.ts';
import { historyPrefix } from '../../utils/keys/historyPrefix/index.ts';
import type { TransactType } from '../../utils/table/types.ts';
import { EXISTS_CONDITION } from '../constants.ts';
import type {
  GetHistoryOptions,
  HistoryOpOptions,
  HistoryRow,
  QueryHistoryOptions,
} from './types.ts';

export const queryHistory = ({
  table,
  scope: { householdId, listId },
}: QueryHistoryOptions): Promise<HistoryRow[]> =>
  table.query(
    {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
        ':prefix': historyPrefix(listId),
      },
    },
    HistoryItemSchema,
  );

export const getHistoryEntry = ({
  table,
  scope,
  name,
}: GetHistoryOptions): Promise<HistoryRow | undefined> =>
  table.get(historyKey({ ...scope, name }), HistoryItemSchema);

export const countHistoryOp = ({ scope, name, shopIds }: HistoryOpOptions): TransactType => ({
  update: historyKey({ ...scope, name }),
  parts: { set: { name, shopIds }, add: { count: 1 } },
});

export const setHistoryShopsOp = ({ scope, name, shopIds }: HistoryOpOptions): TransactType => ({
  update: historyKey({ ...scope, name }),
  parts: { set: { shopIds } },
  condition: { expression: EXISTS_CONDITION },
});
