import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { JSON_HEADERS } from '../../../src/utils/jsonResponse/constants.ts';

// Passkey routes 404 locally, so the served copy switches the passkey UI off.
export const servedConfiguration = (file: string): APIGatewayProxyStructuredResultV2 => {
  const parsed = JSON.parse(file);
  return {
    statusCode: 200,
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({
      ...parsed,
      featureFlags: { ...parsed.featureFlags, ENABLE_PASSKEYS: false },
    }),
  };
};
