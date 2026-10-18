import {
  AdminDeleteUserCommand,
  AdminUserGlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { fetchMemberships } from '../../../../src/handlers/me/utils/fetchMemberships/index.ts';
import { householdIdFromKey } from '../../../../src/utils/keys/index.ts';
import { buildDeletePlan, type Key } from '../buildDeletePlan/index.ts';
import { cognito, doc, TABLE_NAME } from '../clients/index.ts';
import { queryAll } from '../queryAll/index.ts';
import { resolveUser } from '../resolveUser/index.ts';

const deleteKey = (key: Key): Promise<unknown> =>
  doc.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: key['PK'], SK: key['SK'] } }));

const memberSks = async (householdId: string): Promise<string[]> =>
  (
    await queryAll({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: { ':pk': `HH#${householdId}`, ':sk': 'MEMBER#' },
    })
  ).flatMap((item) => (typeof item['SK'] === 'string' ? [item['SK']] : []));

export const runDeleteUser = async (email: string): Promise<{ households: number }> => {
  const { userPoolId, username, sub } = await resolveUser(email);
  await cognito.send(
    new AdminUserGlobalSignOutCommand({ UserPoolId: userPoolId, Username: username }),
  );

  const userItems = await queryAll({
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': `USER#${sub}` },
  });
  const memberships = await fetchMemberships(doc, TABLE_NAME, sub);
  const ids = memberships.flatMap((item) => householdIdFromKey(item['PK']) ?? []);
  const householdMembers = Object.fromEntries(
    await Promise.all(ids.map(async (id) => [id, await memberSks(id)] as const)),
  );
  const { keys, emptyHouseholds } = buildDeletePlan({
    sub,
    userItems,
    memberships,
    householdMembers,
  });

  await Promise.all(
    emptyHouseholds.map(async (id) => {
      const items = await queryAll({
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: { ':pk': `HH#${id}` },
      });
      await Promise.all(items.map(deleteKey));
    }),
  );
  await Promise.all(keys.map(deleteKey));

  await cognito.send(new AdminDeleteUserCommand({ UserPoolId: userPoolId, Username: username }));
  return { households: emptyHouseholds.length };
};
