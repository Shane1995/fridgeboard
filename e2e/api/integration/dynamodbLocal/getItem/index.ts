import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { client } from '../client/index.ts';
import { TABLE_NAME } from '../constants.ts';

export const getItem = async ({
  PK,
  SK,
}: {
  PK: string;
  SK: string;
}): Promise<Record<string, unknown> | undefined> =>
  (
    await client.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK }, ConsistentRead: true }),
    )
  ).Item;
