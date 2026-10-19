import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export const readName = ({ body = '', isBase64Encoded }: APIGatewayProxyEventV2): string => {
  const raw = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;
  try {
    const parsed: { name?: unknown } = JSON.parse(raw) ?? {};
    return typeof parsed.name === 'string' ? parsed.name : '';
  } catch {
    return '';
  }
};
