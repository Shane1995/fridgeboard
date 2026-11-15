import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { claimUsername } from '@fridgeboard/lambda-kit/repository/usernames/index.ts';
import { getConfiguration } from '@fridgeboard/lambda-kit/configuration/index.ts';
import { isValidUsername } from './utils/isValidUsername/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { withAuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/index.ts';
import { readUsername } from './utils/readUsername/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async ({ event, sub }) => {
  const { settings } = await getConfiguration();
  const username = readUsername(event);
  if (
    !isValidUsername(username, {
      min: settings.usernameMinLength,
      max: settings.usernameMaxLength,
    })
  ) {
    return jsonResponse(400, { reason: 'invalid-username' });
  }

  const claimed = await claimUsername({ client, sub, username });
  if (claimed === 'username-set' || claimed === 'username-taken') {
    return jsonResponse(409, { reason: claimed });
  }

  return jsonResponse(200, { username });
});
