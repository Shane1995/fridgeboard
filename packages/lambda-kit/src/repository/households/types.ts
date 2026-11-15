import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { Table } from '../../utils/table/types.ts';

export type HouseholdOptions = { table: Table; householdId: string };

export type GetUsernamesOptions = { table: Table; subs: string[] };

export type QueryChangesOptions = HouseholdOptions & { from: number; to: number };

export type CreateHouseholdRecordOptions = {
  client: DynamoDBDocumentClient;
  id: string;
  sub: string;
  name: string;
  isAdmin: boolean;
  now: string;
};

export type ReserveInviteOptions = {
  client: DynamoDBDocumentClient;
  householdId: string;
  sub: string;
  email: string;
  now: number;
};

export type CreateHouseholdResult = 'created' | 'not-allowed' | 'household-exists';

export type ReserveInviteResult = 'reserved' | 'not-found' | 'limit-reached' | 'already-invited';
