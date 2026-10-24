import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse } from '../../../src/utils/jsonResponse/index.ts';
import { profileKey } from '../../../src/utils/keys/profileKey/index.ts';
import { client } from '../client/index.ts';
import {
  ADMIN_EMAIL,
  API_PORT,
  CONFIGURATION_FILE,
  DYNAMO_PORT,
  TABLE_NAME,
} from '../constants.ts';
import { createTable } from '../createTable/index.ts';
import { decodeToken } from '../decodeToken/index.ts';
import { readBody } from '../readBody/index.ts';
import { ROUTES } from '../route/index.ts';
import { seed } from '../seed/index.ts';
import { sendResult } from '../sendResult/index.ts';
import { servedConfiguration } from '../servedConfiguration/index.ts';
import { subFromEmail } from '../subFromEmail/index.ts';
import { toEvent } from '../toEvent/index.ts';

await createTable(new DynamoDBClient({}), TABLE_NAME);
const { Item } = await client.send(
  new GetCommand({ TableName: TABLE_NAME, Key: profileKey(subFromEmail(ADMIN_EMAIL)) }),
);
if (!Item) {
  await seed(client);
  console.log(`Seeded ${ADMIN_EMAIL} with a household and two invites.`);
}

createServer(async (request, response) => {
  const { pathname: path } = new URL(request.url ?? '/', 'http://localhost');
  const routeKey = `${request.method} ${path}`;
  try {
    if (routeKey === 'GET /configuration.json') {
      sendResult(response, servedConfiguration(readFileSync(CONFIGURATION_FILE, 'utf8')));
      return;
    }
    const entry = ROUTES.get(routeKey);
    if (!entry) {
      sendResult(response, { statusCode: 404 });
      return;
    }
    const claims = decodeToken(request.headers.authorization?.replace(/^Bearer /i, ''));
    if (entry.jwt && !claims) {
      sendResult(response, jsonResponse(401, { reason: 'unauthorised' }));
      return;
    }
    const result = await entry.handler(
      toEvent({ request, body: await readBody(request), path }, claims),
    );
    console.log(`${routeKey} -> ${result.statusCode}`);
    sendResult(response, result);
  } catch (error) {
    console.error(`${routeKey} failed`, error);
    sendResult(response, { statusCode: 500 });
  }
}).listen(API_PORT, '127.0.0.1', () => {
  console.log(`API on http://127.0.0.1:${API_PORT}, DynamoDB Local on :${DYNAMO_PORT}`);
});
