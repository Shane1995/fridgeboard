import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpMethod } from '../../utils/httpMethod/constants.ts';
import { withAuthenticatedUser } from '../../utils/withAuthenticatedUser/index.ts';
import { createHousehold } from './routes/create/index.ts';
import { listMyHouseholds } from './routes/list/index.ts';
import { listMembers } from './routes/members/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// One Lambda for the households resource: GET lists the caller's households (or one household's members), POST creates one.
export const handler = withAuthenticatedUser(async (user) => {
  switch (user.event.requestContext.http.method) {
    case HttpMethod.Get:
      return user.event.pathParameters?.householdId === undefined
        ? listMyHouseholds(user, client)
        : listMembers(user, client);
    case HttpMethod.Post:
      return createHousehold(user, client);
    default:
      return { statusCode: 405 };
  }
});
