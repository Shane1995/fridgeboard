import { buildAuthProtocol } from '.';

const decode = (protocol: string): unknown => {
  const base64 = protocol.slice('header-'.length).replaceAll('-', '+').replaceAll('_', '/');
  return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
};

describe('buildAuthProtocol', () => {
  it('carries the token and the http host as url-safe base64 JSON', () => {
    const protocol = buildAuthProtocol({ token: 'a.b.c', httpHost: 'abc.appsync-api.example.com' });

    expect(protocol.startsWith('header-')).toBe(true);
    expect(decode(protocol)).toEqual({
      Authorization: 'a.b.c',
      host: 'abc.appsync-api.example.com',
    });
  });

  it('never uses characters that are not allowed in a websocket protocol', () => {
    const protocol = buildAuthProtocol({ token: '???>>>~~~', httpHost: 'h' });

    expect(protocol).toMatch(/^header-[A-Za-z0-9_-]+$/);
  });
});
