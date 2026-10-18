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
import {
  householdIdFromKey,
  householdMetaKey,
  membershipGsiKey,
  profileKey,
} from '../../utils/keys/index.ts';
import { jsonResponse } from '../auth/utils/jsonResponse/index.ts';
import {
  ADMIN_GROUP,
  BATCH_GET_LIMIT,
  GROUPS_CLAIM,
  MEMBERSHIP_INDEX,
  MEMBERSHIP_QUERY,
  UNPROCESSED_KEYS_ERROR,
} from './constants.ts';
import { parseGroups } from './utils/parseGroups/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const fetchMemberships = async (
  TableName: string | undefined,
  sub: string,
  ExclusiveStartKey?: Record<string, unknown>,
): Promise<Record<string, unknown>[]> => {
  const { Items = [], LastEvaluatedKey } = await client.send(
    new QueryCommand({
      TableName,
      IndexName: MEMBERSHIP_INDEX,
      KeyConditionExpression: MEMBERSHIP_QUERY,
      ExpressionAttributeValues: { ':pk': membershipGsiKey(sub).GSI1PK },
      ExclusiveStartKey,
    }),
  );
  return LastEvaluatedKey
    ? [...Items, ...(await fetchMemberships(TableName, sub, LastEvaluatedKey))]
    : Items;
};

const batchGetMetas = async (
  TableName: string,
  Keys: Record<string, unknown>[],
  retried = false,
): Promise<Record<string, unknown>[]> => {
  const { Responses, UnprocessedKeys } = await client.send(
    new BatchGetCommand({ RequestItems: { [TableName]: { Keys } } }),
  );
  const found = Responses?.[TableName] ?? [];
  const unprocessed = UnprocessedKeys?.[TableName]?.Keys ?? [];
  if (unprocessed.length === 0) {
    return found;
  }
  if (retried) {
    throw new Error(UNPROCESSED_KEYS_ERROR);
  }
  return [...found, ...(await batchGetMetas(TableName, unprocessed, true))];
};

const fetchHouseholdNames = async (
  TableName: string,
  ids: string[],
): Promise<Map<string, string>> => {
  const names = new Map<string, string>();
  const chunks = Array.from({ length: Math.ceil(ids.length / BATCH_GET_LIMIT) }, (_, i) =>
    ids.slice(i * BATCH_GET_LIMIT, (i + 1) * BATCH_GET_LIMIT).map(householdMetaKey),
  );
  for (const Keys of chunks) {
    for (const { PK, name } of await batchGetMetas(TableName, Keys)) {
      const id = typeof PK === 'string' ? householdIdFromKey(PK) : undefined;
      if (id !== undefined) {
        names.set(id, String(name));
      }
    }
  }
  return names;
};

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

  const memberships = await fetchMemberships(TableName, sub);
  const roles = new Map<string, string>();
  for (const { GSI1SK, role } of memberships) {
    const id = typeof GSI1SK === 'string' ? householdIdFromKey(GSI1SK) : undefined;
    if (id !== undefined && !roles.has(id)) {
      roles.set(id, String(role));
    }
  }

  const names = await fetchHouseholdNames(String(TableName), [...roles.keys()]);
  const households: IMeResponse['households'] = [...roles].flatMap(([id, role]) => {
    const name = names.get(id);
    return name === undefined ? [] : [{ id, name, role }];
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
