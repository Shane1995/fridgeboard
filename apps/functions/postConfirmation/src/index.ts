import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';
import { joinHousehold } from '@fridgeboard/lambda-kit/repository/households/joinHousehold/index.ts';
import { deleteInvite, getInvite } from '@fridgeboard/lambda-kit/repository/invites/index.ts';
import { createProfile } from '@fridgeboard/lambda-kit/repository/profile/index.ts';
import { InviteType } from '@fridgeboard/lambda-kit/utils/keys/types.ts';
import { normaliseEmail } from '@fridgeboard/lambda-kit/utils/normaliseEmail/index.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import { ADMIN_GROUP, CONFIRM_SIGN_UP_SOURCE, MISSING_SUB_ERROR } from './constants.ts';

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

  const table = createTable(client, String(process.env.TABLE_NAME));
  const email = normaliseEmail(event.request.userAttributes.email ?? '');
  const invite = await getInvite({ table, email });
  const type = invite?.type;
  const admin = invite?.admin;
  const hhId = invite?.hhId;

  await createProfile({
    client,
    sub,
    email,
    canCreateHousehold: type === InviteType.App,
    now: new Date().toISOString(),
  });

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
    await deleteInvite({ table, email });
  }

  if (type === InviteType.Household && hhId) {
    await joinHousehold({ client, hhId, sub, email });
  }

  return event;
};
