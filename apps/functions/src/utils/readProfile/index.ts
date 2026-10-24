import { type DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { profileKey } from '../keys/profileKey/index.ts';
import type { Profile } from './types.ts';

export const readProfile = async (
  client: DynamoDBDocumentClient,
  TableName: string | undefined,
  sub: string,
): Promise<Profile | undefined> => {
  const { Item } = await client.send(
    new GetCommand({ TableName, Key: profileKey(sub), ConsistentRead: true }),
  );
  return Item === undefined
    ? undefined
    : {
        email: String(Item.email),
        username: typeof Item.username === 'string' ? Item.username : null,
        canCreateHousehold: Item.canCreateHousehold === true,
      };
};
