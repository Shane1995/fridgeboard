import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpMethod } from '@fridgeboard/lambda-kit/utils/httpMethod/constants.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { resolveList } from '@fridgeboard/lambda-kit/utils/resolveList/index.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import { withAuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/index.ts';
import { HISTORY_PATH_SUFFIX } from './constants.ts';
import { createListItem } from './routes/create/index.ts';
import { getListItem } from './routes/get/index.ts';
import { listHistory } from './routes/history/index.ts';
import { listListItems } from './routes/list/index.ts';
import { removeListItem } from './routes/remove/index.ts';
import { updateListItem } from './routes/update/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async (user) => {
  const table = createTable(client, String(process.env.TABLE_NAME));
  const scope = await resolveList({ user, table });
  if (scope === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  const context = { user, table, scope };
  const method = user.event.requestContext.http.method;
  const itemId = user.event.pathParameters?.itemId;

  if (user.event.rawPath.endsWith(HISTORY_PATH_SUFFIX)) {
    return method === HttpMethod.Get ? listHistory(context) : { statusCode: 405 };
  }
  if (itemId === undefined) {
    switch (method) {
      case HttpMethod.Get:
        return listListItems(context);
      case HttpMethod.Post:
        return createListItem(context);
      default:
        return { statusCode: 405 };
    }
  }
  switch (method) {
    case HttpMethod.Get:
      return getListItem({ context, itemId });
    case HttpMethod.Patch:
      return updateListItem({ context, itemId });
    case HttpMethod.Delete:
      return removeListItem({ context, itemId });
    default:
      return { statusCode: 405 };
  }
});
