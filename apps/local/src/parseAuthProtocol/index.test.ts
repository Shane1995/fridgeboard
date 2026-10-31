import { parseAuthProtocol } from './index.ts';

const header = (value: unknown): string =>
  `header-${Buffer.from(JSON.stringify(value)).toString('base64url')}`;

describe('parseAuthProtocol', () => {
  it('reads the Authorization value from the header protocol', () => {
    expect(
      parseAuthProtocol({
        protocols: ['aws-appsync-event-ws', header({ Authorization: 'tok', host: 'h' })],
      }),
    ).toBe('tok');
  });

  it('returns undefined without a header protocol', () => {
    expect(parseAuthProtocol({ protocols: ['aws-appsync-event-ws'] })).toBeUndefined();
  });

  it('returns undefined for a malformed header', () => {
    expect(parseAuthProtocol({ protocols: ['header-%%%'] })).toBeUndefined();
  });
});
