import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';
import { inviteKey } from '../../utils/keys/inviteKey/index.ts';
import { profileKey } from '../../utils/keys/profileKey/index.ts';
import { InviteItemSchema } from '../../utils/items/inviteItem/index.ts';
import { InviteType } from '../../utils/keys/types.ts';
import { createTable } from '../../utils/table/index.ts';
import { joinHousehold } from './utils/joinHousehold/index.ts';
import { normaliseEmail } from '../../utils/normaliseEmail/index.ts';
import {
  ADMIN_GROUP,
  CONFIRM_SIGN_UP_SOURCE,
  MISSING_SUB_ERROR,
  PROFILE_NOT_EXISTS_CONDITION,
} from './constants.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cognito = new CognitoIdentityProviderClient({});

export const handler = async (
  event: PostConfirmationTriggerEvent,
): Promise<PostConfirmationTriggerEvent> => {
  if (event.triggerSource !== CONFIRM_SIGN_UP_SOURCE) {
    return event;
  }

  const { sub } = event.request.userAttributes;
  if (!sub) {
    throw new Error(MISSING_SUB_ERROR);
  }

  const TableName = process.env.TABLE_NAME;
  const email = normaliseEmail(event.request.userAttributes.email ?? '');
  const Key = inviteKey(email);
  const invite = await createTable(client, String(TableName)).get(Key, InviteItemSchema);
  const type = invite?.type;
  const admin = invite?.admin;
  const hhId = invite?.hhId;

  try {
    await client.send(
      new PutCommand({
        TableName,
        Item: {
          ...profileKey(sub),
          email,
          createdAt: new Date().toISOString(),
          canCreateHousehold: type === InviteType.App,
        },
        ConditionExpression: PROFILE_NOT_EXISTS_CONDITION,
      }),
    );
  } catch (error) {
    if (!(error instanceof ConditionalCheckFailedException)) {
      throw error;
    }
  }

  if (admin === true) {
    await cognito.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: event.userPoolId,
        Username: event.userName,
        GroupName: ADMIN_GROUP,
      }),
    );
  }

  if (type === InviteType.App) {
    await client.send(new DeleteCommand({ TableName, Key }));
  }

  if (type === InviteType.Household && hhId) {
    await joinHousehold(client, TableName, { hhId, sub, invite: Key });
  }

  return event;
};
