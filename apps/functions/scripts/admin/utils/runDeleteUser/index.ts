import {
  AdminDeleteUserCommand,
  AdminUserGlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DeleteEmailIdentityCommand, NotFoundException } from '@aws-sdk/client-sesv2';
import { fetchMemberships } from '../../../../src/utils/fetchMemberships/index.ts';
import { HOUSEHOLD_PK_PREFIX, USER_PK_PREFIX } from '../../../../src/utils/keys/constants.ts';
import { householdIdFromKey } from '../../../../src/utils/keys/householdIdFromKey/index.ts';
import { buildDeletePlan } from '../buildDeletePlan/index.ts';
import { MEMBER_SK_PREFIX } from '../../../../src/utils/keys/constants.ts';
import { TABLE_NAME } from '../clients/constants.ts';
import { cognito, doc, ses } from '../clients/index.ts';
import { queryAll } from '../queryAll/index.ts';
import { resolveUser } from '../resolveUser/index.ts';
import { PK_CONDITION } from './constants.ts';
import type { DeleteUserResult } from './types.ts';
import { deleteKey } from './utils/deleteKey/index.ts';
import { memberSks } from './utils/memberSks/index.ts';

export const runDeleteUser = async (email: string): Promise<DeleteUserResult> => {
  const { userPoolId, username, sub } = await resolveUser(email);
  await cognito.send(
    new AdminUserGlobalSignOutCommand({ UserPoolId: userPoolId, Username: username }),
  );

  const userItems = await queryAll({
    KeyConditionExpression: PK_CONDITION,
    ExpressionAttributeValues: { ':pk': `${USER_PK_PREFIX}${sub}` },
  });
  const memberships = await fetchMemberships(doc, TABLE_NAME, sub);
  const ids = memberships.flatMap((item) => householdIdFromKey(item['PK']) ?? []);
  const householdMembers = Object.fromEntries(
    await Promise.all(
      ids.map(async (id): Promise<[string, string[]]> => [id, await memberSks(id)]),
    ),
  );
  const { keys, emptyHouseholds } = buildDeletePlan({
    sub,
    email,
    userItems,
    memberships,
    householdMembers,
  });

  const own = `${MEMBER_SK_PREFIX}${sub}`;
  await Promise.all(
    emptyHouseholds.map(async (id) => {
      const items = await queryAll({
        KeyConditionExpression: PK_CONDITION,
        ExpressionAttributeValues: { ':pk': `${HOUSEHOLD_PK_PREFIX}${id}` },
      });
      await Promise.all(items.filter((item) => item['SK'] !== own).map(deleteKey));
      await Promise.all(items.filter((item) => item['SK'] === own).map(deleteKey));
    }),
  );
  await Promise.all(keys.map(deleteKey));
  try {
    await ses.send(new DeleteEmailIdentityCommand({ EmailIdentity: username }));
  } catch (error: unknown) {
    if (!(error instanceof NotFoundException)) {
      throw error;
    }
  }

  await cognito.send(new AdminDeleteUserCommand({ UserPoolId: userPoolId, Username: username }));
  return { households: emptyHouseholds.length };
};
