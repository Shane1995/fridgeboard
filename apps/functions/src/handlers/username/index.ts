import { DynamoDBClient, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { getConfiguration } from '../../configuration/index.ts';
import { isValidUsername } from '../../utils/isValidUsername/index.ts';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { profileKey } from '../../utils/keys/profileKey/index.ts';
import { usernameKey } from '../../utils/keys/usernameKey/index.ts';
import { withVerifiedOrigin } from '../../utils/originVerified/index.ts';
import { CONDITION_FAILED, PROFILE_REASON_INDEX } from './constants.ts';
import { readUsername } from './utils/readUsername/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withVerifiedOrigin(
  async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer,
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    const sub = event.requestContext.authorizer.jwt.claims.sub;
    if (typeof sub !== 'string' || sub === '') {
      return { statusCode: 401 };
    }

    const { settings } = await getConfiguration();
    const username = readUsername(event);
    if (
      !isValidUsername(username, {
        min: settings.usernameMinLength,
        max: settings.usernameMaxLength,
      })
    ) {
      return jsonResponse(400, { reason: 'invalid-username' });
    }

    const TableName = process.env.TABLE_NAME;
    try {
      await client.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName,
                Item: { ...usernameKey(username), sub },
                ConditionExpression: 'attribute_not_exists(PK) OR #sub = :sub',
                ExpressionAttributeNames: { '#sub': 'sub' },
                ExpressionAttributeValues: { ':sub': sub },
              },
            },
            {
              Update: {
                TableName,
                Key: profileKey(sub),
                UpdateExpression: 'SET username = :username',
                ConditionExpression:
                  'attribute_exists(PK) AND (attribute_not_exists(username) OR username = :username)',
                ExpressionAttributeValues: { ':username': username },
              },
            },
          ],
        }),
      );
    } catch (error) {
      if (error instanceof TransactionCanceledException) {
        const reasons = error.CancellationReasons ?? [];
        if (reasons[PROFILE_REASON_INDEX]?.Code === CONDITION_FAILED) {
          return jsonResponse(409, { reason: 'username-set' });
        }
        if (reasons.some(({ Code }) => Code === CONDITION_FAILED)) {
          return jsonResponse(409, { reason: 'username-taken' });
        }
      }
      throw error;
    }

    return jsonResponse(200, { username });
  },
);
