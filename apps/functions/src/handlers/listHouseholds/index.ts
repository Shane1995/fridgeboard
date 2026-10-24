import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IHouseholdsResponse } from '@fridgeboard/contract/households';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { listHouseholds } from '../../utils/listHouseholds/index.ts';
import { withVerifiedOrigin } from '../../utils/originVerified/index.ts';
import { createTable } from '../../utils/table/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withVerifiedOrigin(
  async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer,
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    const sub = event.requestContext.authorizer.jwt.claims.sub;
    if (typeof sub !== 'string' || sub === '') {
      return { statusCode: 401 };
    }

    const body: IHouseholdsResponse = {
      households: await listHouseholds(createTable(client, String(process.env.TABLE_NAME)), sub),
    };
    return jsonResponse(200, body);
  },
);
