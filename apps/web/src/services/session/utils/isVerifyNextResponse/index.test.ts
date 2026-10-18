import { isVerifyNextResponse } from './index';

describe('isVerifyNextResponse', () => {
  it('accepts next enter-code', () => {
    expect(isVerifyNextResponse({ next: 'enter-code' })).toBe(true);
  });

  it.each([undefined, null, {}, { next: 'elsewhere' }, 'enter-code'])('rejects %j', (value) => {
    expect(isVerifyNextResponse(value)).toBe(false);
  });
});
