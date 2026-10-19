import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { flowCookie } from '../flowCookie/index.ts';
import type { AuthFlow } from '../flowToken/types.ts';

export const flowResponse = (
  flow: AuthFlow,
  flowKey: string,
  ttlMs: number,
): APIGatewayProxyStructuredResultV2 => ({
  statusCode: 204,
  cookies: [flowCookie(flow, flowKey, ttlMs)],
});
