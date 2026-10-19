import { readStorage } from '.';

describe('readStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns the stored value', () => {
    window.localStorage.setItem('k', 'v');

    expect(readStorage('k')).toBe('v');
  });

  it('returns undefined when nothing is stored', () => {
    expect(readStorage('missing')).toBeUndefined();
  });

  it('returns undefined when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readStorage('k')).toBeUndefined();
  });
});
