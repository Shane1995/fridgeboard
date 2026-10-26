import type { ChangeType } from '@fridgeboard/contract/changes';
import type { Table, TransactType } from '../table/types.ts';

export type ChangeInput = { type: ChangeType; id: string };

export type CommitChangeOptions = {
  table: Table;
  householdId: string;
  changes: readonly [ChangeInput, ...ChangeInput[]];
  items: TransactType[];
};

export type RevConditionOptions = { current: number };
