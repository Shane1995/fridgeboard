import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { resolveHousehold } from '@fridgeboard/lambda-kit/utils/resolveHousehold/index.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import { withAuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/index.ts';
import { ENDPOINTS } from './endpoints/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async (user) => {
  const route = ENDPOINTS.get(user.event.routeKey);
  if (route === undefined) {
    return { statusCode: 404 };
  }
  const table = createTable(client, String(process.env.TABLE_NAME));
  const scope = await resolveHousehold({ user, table });
  if (scope === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  return route({ user, table, scope });
});
