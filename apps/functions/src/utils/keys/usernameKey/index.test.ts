import { usernameKey } from './index.ts';

describe('usernameKey', () => {
  it('builds a lowercase USERNAME claim key', () => {
    expect(usernameKey('Jess_99')).toEqual({ PK: 'USERNAME#jess_99', SK: 'USERNAME' });
  });
});
