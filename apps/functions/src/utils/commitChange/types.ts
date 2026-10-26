import type { ChangeType } from '@fridgeboard/contract/changes';
import type { Table, TransactType } from '../table/types.ts';

export type CommitChangeOptions = {
  table: Table;
  householdId: string;
  type: ChangeType;
  id: string;
  items: TransactType[];
};

export type RevConditionOptions = { current: number };
