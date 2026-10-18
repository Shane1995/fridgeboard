import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import type { IMeResponse } from '@fridgeboard/contract/me';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { profileKey } from '../../utils/keys/profileKey/index.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from './constants.ts';
import { fetchHouseholdNames } from './utils/fetchHouseholdNames/index.ts';
import { fetchMemberships } from './utils/fetchMemberships/index.ts';
import { householdRoles } from './utils/householdRoles/index.ts';
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

  const roles = householdRoles(await fetchMemberships(client, TableName, sub));
  const names = await fetchHouseholdNames(client, String(TableName), [...roles.keys()]);
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
