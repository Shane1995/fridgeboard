import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import type { Secrets } from './utils/loadSecrets/index.ts';

export type AuthRequest = Pick<APIGatewayProxyEventV2, 'body' | 'cookies' | 'isBase64Encoded'>;

export type Route = (
  request: AuthRequest,
  secrets: Secrets,
) => Promise<APIGatewayProxyStructuredResultV2>;
