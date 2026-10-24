import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { readJsonBody } from './index.ts';

const event = (body: string | undefined, isBase64Encoded = false) =>
  ({ body, isBase64Encoded }) as APIGatewayProxyEventV2;

describe('readJsonBody', () => {
  it('parses plain and base64 bodies', () => {
    expect(readJsonBody(event('{"a":1}'))).toEqual({ a: 1 });
    expect(readJsonBody(event(Buffer.from('{"a":1}').toString('base64'), true))).toEqual({ a: 1 });
  });

  it('returns undefined for a missing or broken body', () => {
    expect(readJsonBody(event(undefined))).toBeUndefined();
    expect(readJsonBody(event('{'))).toBeUndefined();
  });
});
