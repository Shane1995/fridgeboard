import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { profileKey } from '../../../src/utils/keys/profileKey/index.ts';
import { ADMIN_EMAIL, TABLE_NAME } from '../constants.ts';
import { createTable } from '../createTable/index.ts';
import { seed } from '../seed/index.ts';
import { subFromEmail } from '../subFromEmail/index.ts';

export const ensureSeeded = async (
  raw: DynamoDBClient,
  client: DynamoDBDocumentClient,
): Promise<boolean> => {
  await createTable(raw, TABLE_NAME);
  const { Item } = await client.send(
    new GetCommand({ TableName: TABLE_NAME, Key: profileKey(subFromEmail(ADMIN_EMAIL)) }),
  );
  if (Item) {
    return false;
  }
  await seed(client);
  return true;
};
