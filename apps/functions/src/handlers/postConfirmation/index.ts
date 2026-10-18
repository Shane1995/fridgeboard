import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';
import { inviteKey, profileKey } from '../../utils/keys/index.ts';
import type { Invite } from '../../utils/keys/index.ts';
import { normaliseEmail } from '../../utils/normaliseEmail/index.ts';
import {
  ADMIN_GROUP,
  APP_INVITE_TYPE,
  PROFILE_NOT_EXISTS_CONDITION,
  CONFIRM_SIGN_UP_SOURCE,
  MISSING_SUB_ERROR,
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
  const { Item } = await client.send(
    new GetCommand({ TableName, Key: inviteKey(email), ConsistentRead: true }),
  );
  const type: Invite['type'] | undefined = Item?.type;
  const admin: Invite['admin'] = Item?.admin;

  try {
    await client.send(
      new PutCommand({
        TableName,
        Item: {
          ...profileKey(sub),
          email,
          createdAt: new Date().toISOString(),
          canCreateHousehold: type === APP_INVITE_TYPE,
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

  if (type === APP_INVITE_TYPE) {
    await client.send(new DeleteCommand({ TableName, Key: inviteKey(email) }));
  }

  return event;
};
