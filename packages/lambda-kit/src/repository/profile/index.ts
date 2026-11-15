import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ProfileItemSchema } from '../../utils/items/profileItem/index.ts';
import { profileKey } from '../../utils/keys/profileKey/index.ts';
import type { Table } from '../../utils/table/types.ts';
import type { CreateProfileOptions, Profile, SaveSkippedSectionsOptions } from './types.ts';

export const getProfile = async (table: Table, sub: string): Promise<Profile | undefined> => {
  const item = await table.get(profileKey(sub), ProfileItemSchema);
  return item === undefined
    ? undefined
    : {
        email: item.email,
        username: item.username ?? null,
        canCreateHousehold: item.canCreateHousehold === true,
        skippedSections: item.skippedSections ?? [],
      };
};

export const saveSkippedSections = ({ table, sub, skippedSections }: SaveSkippedSectionsOptions) =>
  table.update({
    key: profileKey(sub),
    parts: { set: { skippedSections } },
    schema: ProfileItemSchema,
  });

export const createProfile = async ({
  client,
  sub,
  email,
  canCreateHousehold,
  now,
}: CreateProfileOptions): Promise<boolean> => {
  try {
    await client.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: { ...profileKey(sub), email, createdAt: now, canCreateHousehold },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );
    return true;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return false;
    }
    throw error;
  }
};
