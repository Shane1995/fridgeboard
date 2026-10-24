import { createServer } from 'node:http';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { client } from '../client/index.ts';
import { ADMIN_EMAIL, API_PORT, DYNAMO_PORT } from '../constants.ts';
import { ensureSeeded } from '../ensureSeeded/index.ts';
import { handleRequest } from '../handleRequest/index.ts';

if (await ensureSeeded(new DynamoDBClient({}), client)) {
  console.log(`Seeded ${ADMIN_EMAIL} with a household and two invites.`);
}

createServer(handleRequest).listen(API_PORT, '127.0.0.1', () => {
  console.log(`API on http://127.0.0.1:${API_PORT}, DynamoDB Local on :${DYNAMO_PORT}`);
});
