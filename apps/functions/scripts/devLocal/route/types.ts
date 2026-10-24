import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

export type RouteEntry = {
  jwt: boolean;
  handler: (
    event: APIGatewayProxyEventV2WithJWTAuthorizer,
  ) => Promise<APIGatewayProxyStructuredResultV2>;
};
