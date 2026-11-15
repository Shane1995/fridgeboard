import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { Table } from '../../utils/table/types.ts';

export type Profile = {
  email: string;
  username: string | null;
  canCreateHousehold: boolean;
  skippedSections: string[];
};

export type SaveSkippedSectionsOptions = { table: Table; sub: string; skippedSections: string[] };

export type CreateProfileOptions = {
  client: DynamoDBDocumentClient;
  sub: string;
  email: string;
  canCreateHousehold: boolean;
  now: string;
};
