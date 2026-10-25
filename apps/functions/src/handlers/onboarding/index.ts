import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpMethod } from '../../utils/httpMethod/constants.ts';
import { withAuthenticatedUser } from '../../utils/withAuthenticatedUser/index.ts';
import { getOnboarding } from './routes/get/index.ts';
import { skipSection } from './routes/skip/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async (user) => {
  switch (user.event.requestContext.http.method) {
    case HttpMethod.Get:
      return getOnboarding(user, client);
    case HttpMethod.Post:
      return skipSection(user, client);
    default:
      return { statusCode: 405 };
  }
});
