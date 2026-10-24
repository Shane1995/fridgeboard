import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpMethod } from '../../utils/httpMethod/constants.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { resolveList } from '../../utils/resolveList/index.ts';
import { createTable } from '../../utils/table/index.ts';
import { withAuthenticatedUser } from '../../utils/withAuthenticatedUser/index.ts';
import { ORDER_PATH_SUFFIX } from './constants.ts';
import { createListBucket } from './routes/create/index.ts';
import { listListBuckets } from './routes/list/index.ts';
import { removeListBucket } from './routes/remove/index.ts';
import { reorderListBuckets } from './routes/reorder/index.ts';
import { updateListBucket } from './routes/update/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async (user) => {
  const table = createTable(client, String(process.env.TABLE_NAME));
  const scope = await resolveList({ user, table });
  if (scope === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  const context = { user, table, scope };
  const method = user.event.requestContext.http.method;
  const bucketId = user.event.pathParameters?.bucketId;

  if (user.event.rawPath.endsWith(ORDER_PATH_SUFFIX)) {
    return method === HttpMethod.Put ? reorderListBuckets(context) : { statusCode: 405 };
  }
  if (bucketId === undefined) {
    switch (method) {
      case HttpMethod.Get:
        return listListBuckets(context);
      case HttpMethod.Post:
        return createListBucket(context);
      default:
        return { statusCode: 405 };
    }
  }
  switch (method) {
    case HttpMethod.Patch:
      return updateListBucket({ context, bucketId });
    case HttpMethod.Delete:
      return removeListBucket({ context, bucketId });
    default:
      return { statusCode: 405 };
  }
});
