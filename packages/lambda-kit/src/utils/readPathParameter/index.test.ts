import type { AuthenticatedUser } from '../withAuthenticatedUser/types.ts';
import { readPathParameter } from './index.ts';

const userWith = (pathParameters?: Record<string, string>) =>
  ({ event: { pathParameters }, claims: {}, sub: 's1' }) as unknown as AuthenticatedUser;

describe('readPathParameter', () => {
  it('reads the named path parameter', () => {
    expect(readPathParameter({ user: userWith({ itemId: 'i1' }), name: 'itemId' })).toBe('i1');
  });

  it('is empty when the parameter is absent', () => {
    expect(readPathParameter({ user: userWith({}), name: 'itemId' })).toBe('');
    expect(readPathParameter({ user: userWith(), name: 'itemId' })).toBe('');
  });
});
