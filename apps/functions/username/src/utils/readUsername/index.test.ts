import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { readUsername } from './index.ts';

const event = (body: string | undefined, isBase64Encoded = false): APIGatewayProxyEventV2 =>
  ({ body, isBase64Encoded }) as APIGatewayProxyEventV2;

describe('readUsername', () => {
  it('reads a string username', () => {
    expect(readUsername(event('{"username":"jess"}'))).toBe('jess');
  });

  it('decodes base64 bodies', () => {
    const body = Buffer.from('{"username":"jess"}').toString('base64');

    expect(readUsername(event(body, true))).toBe('jess');
  });

  it.each([undefined, 'not json', '{"username":42}', 'null'])('returns empty for %j', (body) => {
    expect(readUsername(event(body))).toBe('');
  });
});
