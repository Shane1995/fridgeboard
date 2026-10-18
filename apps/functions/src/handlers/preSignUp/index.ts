import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import type { PreSignUpTriggerEvent } from 'aws-lambda';
import { inviteKey } from '../../utils/keys/index.ts';
import type { Invite } from '../../utils/keys/types.ts';
import { NO_INVITE_ERROR } from './constants.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: PreSignUpTriggerEvent): Promise<PreSignUpTriggerEvent> => {
  const { Item } = await client.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: inviteKey(event.request.userAttributes.email ?? ''),
      ConsistentRead: true,
    }),
  );
  const expiresAt: Invite['expiresAt'] | undefined = Item?.expiresAt;

  if (typeof expiresAt !== 'number' || expiresAt <= Math.floor(Date.now() / 1000)) {
    throw new Error(NO_INVITE_ERROR);
  }

  return event;
};
