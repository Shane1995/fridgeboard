import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export const readUsername = ({ body = '', isBase64Encoded }: APIGatewayProxyEventV2): string => {
  const raw = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;
  try {
    const parsed: { username?: unknown } = JSON.parse(raw) ?? {};
    return typeof parsed.username === 'string' ? parsed.username : '';
  } catch {
    return '';
  }
};
