import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ENDPOINT, REGION } from '../constants.ts';

export const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    endpoint: ENDPOINT,
    region: REGION,
    credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
  }),
);
