import { HOUSEHOLD_PK_PREFIX, RULE_SK_PREFIX } from '../constants.ts';
import type { TableKey } from '../types.ts';
import type { RuleKeyOptions } from './types.ts';

export const ruleKey = ({ householdId, ruleId }: RuleKeyOptions): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${RULE_SK_PREFIX}${ruleId}`,
});
