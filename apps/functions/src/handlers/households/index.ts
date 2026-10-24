import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpMethod } from '../../utils/httpMethod/constants.ts';
import { withAuthenticatedUser } from '../../utils/withAuthenticatedUser/index.ts';
import { createHousehold } from './routes/create/index.ts';
import { listMyHouseholds } from './routes/list/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// One Lambda for the households resource: GET lists the caller's households, POST creates one.
export const handler = withAuthenticatedUser(async (user) => {
  switch (user.event.requestContext.http.method) {
    case HttpMethod.Get:
      return listMyHouseholds(user, client);
    case HttpMethod.Post:
      return createHousehold(user, client);
    default:
      return { statusCode: 405 };
  }
});
