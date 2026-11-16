import type { IEventRule, IEventRuleFrequency } from '@fridgeboard/contract/events';
import type * as z from 'zod/mini';
import { RuleItemSchema } from '../../utils/items/ruleItem/index.ts';
import { HOUSEHOLD_PK_PREFIX, RULE_SK_PREFIX } from '../../utils/keys/constants.ts';
import { ruleKey } from '../../utils/keys/ruleKey/index.ts';
import type { TransactType } from '../../utils/table/types.ts';
import type {
  DeleteRuleOpOptions,
  GetRuleOptions,
  PutRuleOpOptions,
  QueryRulesOptions,
} from './types.ts';

const toRule = (row: z.infer<typeof RuleItemSchema>): IEventRule => {
  const base = {
    id: row.id,
    title: row.title,
    note: row.note,
    ownerId: row.ownerId,
    startDate: row.startDate,
    frequency: row.frequency as IEventRuleFrequency,
    interval: row.interval,
    skip: row.skip,
    ...(row.weekdays === undefined ? {} : { weekdays: row.weekdays }),
    ...(row.until === undefined ? {} : { until: row.until }),
    ...(row.color === undefined ? {} : { color: row.color }),
    ...(row.reminder === undefined ? {} : { reminder: row.reminder }),
  };
  return row.allDay
    ? { ...base, allDay: true }
    : { ...base, allDay: false, startTime: row.startTime ?? '', endTime: row.endTime ?? '' };
};

export const queryRules = async ({
  table,
  scope: { householdId },
}: QueryRulesOptions): Promise<IEventRule[]> =>
  (
    await table.query(
      {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
          ':prefix': RULE_SK_PREFIX,
        },
      },
      RuleItemSchema,
    )
  )
    .map(toRule)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id));

export const getRule = async ({
  table,
  scope,
  ruleId,
}: GetRuleOptions): Promise<IEventRule | undefined> => {
  const row = await table.get(ruleKey({ ...scope, ruleId }), RuleItemSchema);
  return row === undefined ? undefined : toRule(row);
};

export const putRuleOp = ({ scope, rule }: PutRuleOpOptions): TransactType => ({
  put: { ...ruleKey({ ...scope, ruleId: rule.id }), ...rule },
});

export const deleteRuleOp = ({ scope, ruleId }: DeleteRuleOpOptions): TransactType => ({
  delete: ruleKey({ ...scope, ruleId }),
});
