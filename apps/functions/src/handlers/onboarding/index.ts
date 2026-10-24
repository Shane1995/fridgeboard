import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { withVerifiedOrigin } from '../../utils/originVerified/index.ts';
import { pendingOnboarding } from '../../utils/pendingOnboarding/index.ts';
import { readProfile } from '../../utils/readProfile/index.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from '../me/constants.ts';
import { parseGroups } from '../me/utils/parseGroups/index.ts';

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

    const TableName = process.env.TABLE_NAME;
    const profile = await readProfile(client, TableName, sub);
    if (!profile) {
      return { statusCode: 404 };
    }

    const body: IOnboardingResponse = {
      sections: await pendingOnboarding(client, TableName, {
        sub,
        profile,
        isAdmin: parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP),
      }),
    };
    return jsonResponse(200, body);
  },
);
