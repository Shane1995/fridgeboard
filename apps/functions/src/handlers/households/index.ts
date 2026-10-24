import { randomUUID } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import {
  HOUSEHOLD_NAME_MAX_LENGTH,
  HOUSEHOLD_NAME_MIN_LENGTH,
} from '@fridgeboard/contract/households/constants';
import type { ICreateHouseholdResponse } from '@fridgeboard/contract/households';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { JSON_HEADERS } from '../../utils/jsonResponse/constants.ts';
import { withVerifiedOrigin } from '../../utils/originVerified/index.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from '../me/constants.ts';
import { parseGroups } from '../me/utils/parseGroups/index.ts';
import { HouseholdRole } from '../../utils/isHouseholdRole/constants.ts';
import { LOCATION_HEADER } from './constants.ts';
import { buildCreateTransaction } from './utils/buildCreateTransaction/index.ts';
import { mapCancellation } from './utils/mapCancellation/index.ts';
import { readName } from './utils/readName/index.ts';

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

    const name = readName(event).trim();
    if (name.length < HOUSEHOLD_NAME_MIN_LENGTH || name.length > HOUSEHOLD_NAME_MAX_LENGTH) {
      return jsonResponse(400, { reason: 'invalid-name' });
    }

    const id = randomUUID();
    try {
      await client.send(
        new TransactWriteCommand({
          TransactItems: buildCreateTransaction({
            TableName: process.env.TABLE_NAME,
            id,
            sub,
            name,
            isAdmin: parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP),
            now: new Date().toISOString(),
          }),
        }),
      );
    } catch (error) {
      const failure = mapCancellation(error);
      if (failure) {
        return failure;
      }
      throw error;
    }

    const body: ICreateHouseholdResponse = { id, name, role: HouseholdRole.Owner };
    return {
      ...jsonResponse(201, body),
      headers: { ...JSON_HEADERS, [LOCATION_HEADER]: `/api/v1/households/${id}` },
    };
  },
);
