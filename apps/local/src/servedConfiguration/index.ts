import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { API_PORT } from '../constants.ts';
import { JSON_HEADERS } from '../../../functions/src/utils/jsonResponse/constants.ts';

// Passkey routes 404 locally, so the served copy switches the passkey UI off and
// points live sync at the local AppSync Events stand-in.
export const servedConfiguration = (file: string): APIGatewayProxyStructuredResultV2 => {
  const parsed = JSON.parse(file);
  return {
    statusCode: 200,
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({
      ...parsed,
      featureFlags: { ...parsed.featureFlags, ENABLE_PASSKEYS: false },
      services: {
        ...parsed.services,
        realtime: { realtimeHost: `127.0.0.1:${API_PORT}`, httpHost: `127.0.0.1:${API_PORT}` },
      },
    }),
  };
};
