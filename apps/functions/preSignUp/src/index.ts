import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { PreSignUpTriggerEvent } from 'aws-lambda';
import { getInviteExpiry } from '@fridgeboard/lambda-kit/repository/invites/index.ts';
import { NO_INVITE_ERROR } from '@fridgeboard/lambda-kit/utils/noInviteError/constants.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: PreSignUpTriggerEvent): Promise<PreSignUpTriggerEvent> => {
  const table = createTable(client, String(process.env.TABLE_NAME));
  const expiresAt = await getInviteExpiry({
    table,
    email: event.request.userAttributes.email ?? '',
  });

  if (expiresAt === undefined || expiresAt <= Math.floor(Date.now() / 1000)) {
    throw new Error(NO_INVITE_ERROR);
  }

  return event;
};
