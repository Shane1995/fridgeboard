import { isCreationOptions } from '.';

describe('isCreationOptions', () => {
  it('accepts options with a challenge and a user', () => {
    expect(isCreationOptions({ challenge: 'abc', user: { id: 'u' } })).toBe(true);
  });

  it.each([null, 'x', {}, { challenge: 'abc' }, { challenge: 'abc', user: null }, { user: {} }])(
    'rejects %j',
    (value) => {
      expect(isCreationOptions(value)).toBe(false);
    },
  );
});
