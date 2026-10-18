import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export type BodyField = 'email' | 'code';

export type BodySource = Pick<APIGatewayProxyEventV2, 'body' | 'isBase64Encoded'>;
