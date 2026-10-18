import { getEpoch } from './index';

describe('getEpoch', () => {
  it('starts at zero', () => {
    expect(getEpoch()).toBe(0);
  });
});
