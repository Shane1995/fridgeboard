import { readLocalStorage } from '.';

describe('readLocalStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns the stored value', () => {
    window.localStorage.setItem('k', 'v');

    expect(readLocalStorage('k')).toBe('v');
  });

  it('returns undefined when nothing is stored', () => {
    expect(readLocalStorage('missing')).toBeUndefined();
  });

  it('returns undefined when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readLocalStorage('k')).toBeUndefined();
  });
});
