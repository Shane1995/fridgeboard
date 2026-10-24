import type { IncomingMessage } from 'node:http';
import { ORIGIN_HEADER, ORIGIN_SECRET } from '../constants.ts';
import { toEvent } from './index.ts';

const request = (headers: Record<string, string | string[]>): IncomingMessage =>
  ({ method: 'PUT', headers }) as IncomingMessage;

describe('toEvent', () => {
  it('adds the origin secret, splits cookies and carries the claims', () => {
    const event = toEvent(
      { request: request({ cookie: 'a=1; b=2' }), body: '{"x":1}', path: '/api/v1/me' },
      { sub: 's1', email: 'a@x.com', groups: ['admin'] },
    );

    expect(event.headers[ORIGIN_HEADER]).toBe(ORIGIN_SECRET);
    expect(event.cookies).toEqual(['a=1', 'b=2']);
    expect(event.routeKey).toBe('PUT /api/v1/me');
    expect(event.body).toBe('{"x":1}');
    expect(event.requestContext.authorizer.jwt.claims).toMatchObject({
      sub: 's1',
      'cognito:groups': ['admin'],
    });
  });

  it('omits the body when empty', () => {
    const event = toEvent({ request: request({}), body: '', path: '/' }, undefined);

    expect(event).not.toHaveProperty('body');
  });
});
