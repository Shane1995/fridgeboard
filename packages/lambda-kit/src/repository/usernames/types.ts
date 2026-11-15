import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export type ClaimUsernameOptions = {
  client: DynamoDBDocumentClient;
  sub: string;
  username: string;
};

export type ClaimUsernameResult = 'claimed' | 'username-set' | 'username-taken';
