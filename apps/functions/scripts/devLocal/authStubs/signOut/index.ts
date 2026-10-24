import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { REFRESH_COOKIE } from '../../constants.ts';
import { localCookie } from '../../localCookie/index.ts';

export const signOut = async (): Promise<APIGatewayProxyStructuredResultV2> => ({
  statusCode: 204,
  cookies: [localCookie(REFRESH_COOKIE, '', 0)],
});
