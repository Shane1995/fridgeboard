import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';

export type JwtClaims =
  APIGatewayProxyEventV2WithJWTAuthorizer['requestContext']['authorizer']['jwt']['claims'];

export type AuthenticatedUser = {
  event: APIGatewayProxyEventV2WithJWTAuthorizer;
  claims: JwtClaims;
  sub: string;
};
