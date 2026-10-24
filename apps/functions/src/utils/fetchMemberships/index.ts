import { type DynamoDBDocumentClient, paginateQuery } from '@aws-sdk/lib-dynamodb';
import { membershipGsiKey } from '../keys/membershipGsiKey/index.ts';
import { MEMBERSHIP_INDEX, MEMBERSHIP_PK_VALUE, MEMBERSHIP_QUERY } from './constants.ts';

export const fetchMemberships = async (
  client: DynamoDBDocumentClient,
  TableName: string | undefined,
  sub: string,
): Promise<Record<string, unknown>[]> => {
  const pages = await Array.fromAsync(
    paginateQuery(
      { client },
      {
        TableName,
        IndexName: MEMBERSHIP_INDEX,
        KeyConditionExpression: MEMBERSHIP_QUERY,
        ExpressionAttributeValues: { [MEMBERSHIP_PK_VALUE]: membershipGsiKey(sub).GSI1PK },
      },
    ),
  );
  return pages.flatMap((page) => page.Items ?? []);
};
