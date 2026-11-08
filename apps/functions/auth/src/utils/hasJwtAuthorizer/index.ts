import type { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';

export const hasJwtAuthorizer = (
  event: APIGatewayProxyEventV2,
): event is APIGatewayProxyEventV2WithJWTAuthorizer =>
  'authorizer' in event.requestContext &&
  typeof event.requestContext.authorizer === 'object' &&
  event.requestContext.authorizer !== null &&
  'jwt' in event.requestContext.authorizer;
