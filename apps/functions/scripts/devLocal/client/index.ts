import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Reads AWS_ENDPOINT_URL_DYNAMODB and the dummy credentials the launcher sets.
export const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
