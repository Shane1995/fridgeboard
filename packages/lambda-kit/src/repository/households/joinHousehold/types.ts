import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export type JoinHouseholdOptions = {
  client: DynamoDBDocumentClient;
  hhId: string;
  sub: string;
  email: string;
};
