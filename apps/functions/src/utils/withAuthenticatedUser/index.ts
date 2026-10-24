import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { withVerifiedOrigin } from '../originVerified/index.ts';
import type { AuthenticatedUser } from './types.ts';

// What every signed-in route starts with: the request came through CloudFront, and the JWT
// carries a subject. The handler then only deals with its own work.
export const withAuthenticatedUser = (
  handler: (user: AuthenticatedUser) => Promise<APIGatewayProxyStructuredResultV2>,
) =>
  withVerifiedOrigin(
    async (
      event: APIGatewayProxyEventV2WithJWTAuthorizer,
    ): Promise<APIGatewayProxyStructuredResultV2> => {
      const claims = event.requestContext.authorizer.jwt.claims;
      const sub = claims.sub;
      if (typeof sub !== 'string' || sub === '') {
        return { statusCode: 401 };
      }
      return handler({ event, claims, sub });
    },
  );
