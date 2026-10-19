import { toMutationOptions } from './index';

describe('toMutationOptions', () => {
  it('maps retry', () => {
    expect(toMutationOptions({ retry: 0 })).toEqual({ retry: 0 });
  });

  it('omits retry when absent', () => {
    expect(toMutationOptions({})).toEqual({});
  });
});
