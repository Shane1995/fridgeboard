import type { QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export type QueryAllInput = Omit<QueryCommandInput, 'TableName' | 'ExclusiveStartKey'>;
