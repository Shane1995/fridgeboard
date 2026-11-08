import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { readName } from './index.ts';

const event = (body?: string, isBase64Encoded = false): APIGatewayProxyEventV2 =>
  ({ body, isBase64Encoded }) as APIGatewayProxyEventV2;

describe('readName', () => {
  it('reads the name string', () => {
    expect(readName(event('{"name":"Home"}'))).toBe('Home');
  });

  it('decodes a base64 body', () => {
    expect(readName(event(Buffer.from('{"name":"Home"}').toString('base64'), true))).toBe('Home');
  });

  it.each([undefined, '', 'not json', 'null', '{"name":7}', '{}', '"x"'])(
    'returns an empty string for %j',
    (body) => {
      expect(readName(event(body))).toBe('');
    },
  );
});
