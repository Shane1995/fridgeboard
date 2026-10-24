import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpMethod } from '../../utils/httpMethod/constants.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { resolveList } from '../../utils/resolveList/index.ts';
import { createTable } from '../../utils/table/index.ts';
import { withAuthenticatedUser } from '../../utils/withAuthenticatedUser/index.ts';
import { ORDER_PATH_SUFFIX } from './constants.ts';
import { createListShop } from './routes/create/index.ts';
import { listListShops } from './routes/list/index.ts';
import { removeListShop } from './routes/remove/index.ts';
import { reorderListShops } from './routes/reorder/index.ts';
import { updateListShop } from './routes/update/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async (user) => {
  const table = createTable(client, String(process.env.TABLE_NAME));
  const scope = await resolveList({ user, table });
  if (scope === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  const context = { user, table, scope };
  const method = user.event.requestContext.http.method;
  const shopId = user.event.pathParameters?.shopId;

  if (user.event.rawPath.endsWith(ORDER_PATH_SUFFIX)) {
    return method === HttpMethod.Put ? reorderListShops(context) : { statusCode: 405 };
  }
  if (shopId === undefined) {
    switch (method) {
      case HttpMethod.Get:
        return listListShops(context);
      case HttpMethod.Post:
        return createListShop(context);
      default:
        return { statusCode: 405 };
    }
  }
  switch (method) {
    case HttpMethod.Patch:
      return updateListShop({ context, shopId });
    case HttpMethod.Delete:
      return removeListShop({ context, shopId });
    default:
      return { statusCode: 405 };
  }
});
