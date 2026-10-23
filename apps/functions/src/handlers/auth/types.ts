import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import type { RouteAccess } from './constants.ts';
import type { Secrets } from './utils/loadSecrets/types.ts';

export type AuthRequest = Pick<APIGatewayProxyEventV2, 'body' | 'cookies' | 'isBase64Encoded'>;

export type Route = (
  request: AuthRequest,
  secrets: Secrets,
) => Promise<APIGatewayProxyStructuredResultV2>;

export type AuthorizedRequest = AuthRequest &
  Pick<APIGatewayProxyEventV2WithJWTAuthorizer, 'headers' | 'requestContext'>;

export type AuthorizedRoute = (
  request: AuthorizedRequest,
  secrets: Secrets,
) => Promise<APIGatewayProxyStructuredResultV2>;

export type RouteEntry =
  | { access: RouteAccess.Public; handler: Route }
  | { access: RouteAccess.Jwt; handler: AuthorizedRoute };
