import type { WebService } from '../../../../web/src/services/configuration/services/constants.ts';
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

export type RouteDefinition = RouteEntry & { method: string; service: WebService };
