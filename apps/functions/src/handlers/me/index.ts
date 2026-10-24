import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IMeResponse } from '@fridgeboard/contract/me';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { withVerifiedOrigin } from '../../utils/originVerified/index.ts';
import { readProfile } from '../../utils/readProfile/index.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from './constants.ts';
import { parseGroups } from './utils/parseGroups/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withVerifiedOrigin(
  async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer,
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    const claims = event.requestContext.authorizer.jwt.claims;
    const sub = claims.sub;
    if (typeof sub !== 'string' || sub === '') {
      return { statusCode: 401 };
    }

    const profile = await readProfile(client, process.env.TABLE_NAME, sub);
    if (!profile) {
      return { statusCode: 404 };
    }

    const body: IMeResponse = {
      sub,
      email: profile.email,
      username: profile.username,
      isAdmin: parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP),
      canCreateHousehold: profile.canCreateHousehold,
    };
    return jsonResponse(200, body);
  },
);
