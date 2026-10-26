import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SESv2Client } from '@aws-sdk/client-sesv2';
import { HttpMethod } from '../../utils/httpMethod/constants.ts';
import { withAuthenticatedUser } from '../../utils/withAuthenticatedUser/index.ts';
import { CHANGES_PATH_SUFFIX } from './constants.ts';
import { listChanges } from './routes/changes/index.ts';
import { createHousehold } from './routes/create/index.ts';
import { inviteToHousehold } from './routes/invite/index.ts';
import { listMyHouseholds } from './routes/list/index.ts';
import { listMembers } from './routes/members/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESv2Client({});

// One Lambda for the households resource: GET lists the caller's households (or one household's members or changes), POST creates one (or invites someone to one).
export const handler = withAuthenticatedUser(async (user) => {
  switch (user.event.requestContext.http.method) {
    case HttpMethod.Get:
      if (user.event.pathParameters?.householdId === undefined) {
        return listMyHouseholds(user, client);
      }
      return user.event.rawPath.endsWith(CHANGES_PATH_SUFFIX)
        ? listChanges(user, client)
        : listMembers(user, client);
    case HttpMethod.Post:
      return user.event.pathParameters?.householdId === undefined
        ? createHousehold(user, client)
        : inviteToHousehold(user, client, ses);
    default:
      return { statusCode: 405 };
  }
});
