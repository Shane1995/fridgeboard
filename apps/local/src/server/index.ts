import { createServer } from 'node:http';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SSMClient } from '@aws-sdk/client-ssm';
import { bootstrap } from '../bootstrap/index.ts';
import { client } from '../client/index.ts';
import { ADMIN_EMAIL, API_PORT, LOCALSTACK_PORT } from '../constants.ts';
import { ensureSeeded } from '../ensureSeeded/index.ts';
import { attachRealtime } from '../attachRealtime/index.ts';
import { handleRequest } from '../handleRequest/index.ts';
import { hub } from '../localHub/index.ts';

await bootstrap({
  sqs: new SQSClient({ useQueueUrlAsEndpoint: false }),
  ssm: new SSMClient({}),
  s3: new S3Client({ forcePathStyle: true }),
});

if (await ensureSeeded(new DynamoDBClient({}), client)) {
  console.log(`Seeded ${ADMIN_EMAIL} with a household and two invites.`);
}

const server = createServer(handleRequest);
attachRealtime({ server, hub });
server.listen(API_PORT, '127.0.0.1', () => {
  console.log(`API on http://127.0.0.1:${API_PORT}, LocalStack on :${LOCALSTACK_PORT}`);
});
