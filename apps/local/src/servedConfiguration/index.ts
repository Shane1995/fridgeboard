import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { JSON_HEADERS } from '../../../functions/src/utils/jsonResponse/constants.ts';

export const servedConfiguration = (file: string): APIGatewayProxyStructuredResultV2 => ({
  statusCode: 200,
  headers: { ...JSON_HEADERS },
  body: file,
});
