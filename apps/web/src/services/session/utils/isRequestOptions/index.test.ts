import { isRequestOptions } from '.';

describe('isRequestOptions', () => {
  it('accepts options with a challenge', () => {
    expect(isRequestOptions({ challenge: 'abc', rpId: 'fridgeboard.uk' })).toBe(true);
  });

  it.each([null, undefined, 'x', 7, {}, { challenge: '' }, { challenge: 7 }])(
    'rejects %j',
    (value) => {
      expect(isRequestOptions(value)).toBe(false);
    },
  );
});
