import { timingSafeEqual } from 'node:crypto';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonResponse } from '../jsonResponse/index.ts';
import { ORIGIN_VERIFY_HEADER } from './constants.ts';

const isVerifiedOrigin = (
  headers: Record<string, string | undefined>,
  secret: string | undefined,
): boolean => {
  const received = headers[ORIGIN_VERIFY_HEADER];
  if (!secret || received === undefined) {
    return false;
  }
  const expected = Buffer.from(secret);
  const actual = Buffer.from(received);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export const withVerifiedOrigin =
  <Event extends { headers: Record<string, string | undefined> }>(
    handler: (event: Event) => Promise<APIGatewayProxyStructuredResultV2>,
  ) =>
  async (event: Event): Promise<APIGatewayProxyStructuredResultV2> =>
    isVerifiedOrigin(event.headers, process.env.API_ORIGIN_SECRET)
      ? handler(event)
      : jsonResponse(403, { reason: 'forbidden' });
