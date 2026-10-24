import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export const readJsonBody = ({ body = '', isBase64Encoded }: APIGatewayProxyEventV2): unknown => {
  const raw = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};
