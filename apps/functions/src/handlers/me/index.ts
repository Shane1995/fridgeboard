import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import type { IMeResponse } from '@fridgeboard/contract';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { jsonResponse } from '../auth/utils/jsonResponse/index.ts';
import { householdMetaKey, membershipGsiKey, profileKey } from '../../utils/keys/index.ts';
import {
  ADMIN_GROUP,
  GROUPS_CLAIM,
  HOUSEHOLD_ID_PREFIX,
  MEMBERSHIP_INDEX,
  MEMBERSHIP_QUERY,
} from './constants.ts';
import { parseGroups } from './utils/parseGroups/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const sub = claims.sub;
  if (typeof sub !== 'string' || sub === '') {
    return { statusCode: 401 };
  }

  const TableName = process.env.TABLE_NAME;
  const { Item: profile } = await client.send(
    new GetCommand({ TableName, Key: profileKey(sub), ConsistentRead: true }),
  );
  if (!profile) {
    return { statusCode: 404 };
  }

  const { Items: memberships = [] } = await client.send(
    new QueryCommand({
      TableName,
      IndexName: MEMBERSHIP_INDEX,
      KeyConditionExpression: MEMBERSHIP_QUERY,
      ExpressionAttributeValues: { ':pk': membershipGsiKey(sub).GSI1PK },
    }),
  );

  const ids = memberships.map(({ GSI1SK }) => String(GSI1SK).slice(HOUSEHOLD_ID_PREFIX.length));
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { Responses } = await client.send(
      new BatchGetCommand({
        RequestItems: { [String(TableName)]: { Keys: ids.map(householdMetaKey) } },
      }),
    );
    for (const meta of Responses?.[String(TableName)] ?? []) {
      names.set(String(meta.PK).slice(HOUSEHOLD_ID_PREFIX.length), String(meta.name));
    }
  }

  const households: IMeResponse['households'] = memberships.flatMap(({ GSI1SK, role }) => {
    const id = String(GSI1SK).slice(HOUSEHOLD_ID_PREFIX.length);
    const name = names.get(id);
    return name === undefined ? [] : [{ id, name, role: String(role) }];
  });

  const body: IMeResponse = {
    sub,
    email: String(profile.email),
    isAdmin: parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP),
    canCreateHousehold: profile.canCreateHousehold === true,
    households,
  };
  return jsonResponse(200, body);
};
