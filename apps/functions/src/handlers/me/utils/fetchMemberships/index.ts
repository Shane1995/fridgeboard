import { type DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { membershipGsiKey } from '../../../../utils/keys/index.ts';
import { MEMBERSHIP_INDEX, MEMBERSHIP_PK_VALUE, MEMBERSHIP_QUERY } from './constants.ts';

export const fetchMemberships = async (
  client: DynamoDBDocumentClient,
  TableName: string | undefined,
  sub: string,
  ExclusiveStartKey?: Record<string, unknown>,
): Promise<Record<string, unknown>[]> => {
  const { Items = [], LastEvaluatedKey } = await client.send(
    new QueryCommand({
      TableName,
      IndexName: MEMBERSHIP_INDEX,
      KeyConditionExpression: MEMBERSHIP_QUERY,
      ExpressionAttributeValues: { [MEMBERSHIP_PK_VALUE]: membershipGsiKey(sub).GSI1PK },
      ExclusiveStartKey,
    }),
  );
  return LastEvaluatedKey
    ? [...Items, ...(await fetchMemberships(client, TableName, sub, LastEvaluatedKey))]
    : Items;
};
