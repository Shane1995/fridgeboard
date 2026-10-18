import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SESv2Client } from '@aws-sdk/client-sesv2';
import { SSMClient } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { REGION } from './constants.ts';

export { SECRETS_PARAM, TABLE_NAME } from './constants.ts';

export const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
export const cognito = new CognitoIdentityProviderClient({ region: REGION });
export const ses = new SESv2Client({ region: REGION });
export const ssm = new SSMClient({ region: REGION });
