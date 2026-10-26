import { CHANGE_REV_WIDTH, CHANGE_SK_PREFIX, HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import type { TableKey } from '../types.ts';
import type { ChangeKeyOptions } from './types.ts';

export const changeKey = ({ householdId, rev }: ChangeKeyOptions): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${CHANGE_SK_PREFIX}${String(rev).padStart(CHANGE_REV_WIDTH, '0')}`,
});
