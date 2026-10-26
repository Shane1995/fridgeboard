import type { CHANGE_TYPES } from './constants.ts';

export type ChangeType = (typeof CHANGE_TYPES)[number];

export type IChange = {
  id: string;
  rev: number;
  type: ChangeType;
};

export type IChangesResponse =
  | { rev: number; changes: IChange[] }
  | { rev: number; snapshot: true };
