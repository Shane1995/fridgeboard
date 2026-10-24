import type { ServerResponse } from 'node:http';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export const sendResult = (
  response: Pick<ServerResponse, 'writeHead' | 'end'>,
  { statusCode = 200, headers = {}, cookies = [], body = '' }: APIGatewayProxyStructuredResultV2,
): void => {
  response.writeHead(statusCode, {
    ...headers,
    ...(cookies.length > 0 ? { 'set-cookie': cookies } : {}),
  });
  response.end(body);
};
