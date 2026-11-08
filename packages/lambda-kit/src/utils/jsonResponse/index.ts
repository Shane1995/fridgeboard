import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { JSON_HEADERS } from './constants.ts';
import type { ResponseBody } from './types.ts';

export const jsonResponse = (
  statusCode: number,
  body: ResponseBody,
  cookies: string[] = [],
): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  headers: { ...JSON_HEADERS },
  body: JSON.stringify(body),
  cookies,
});
