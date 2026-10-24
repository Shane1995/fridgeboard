import { writeLocalStorage } from '.';

describe('writeLocalStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores a value', () => {
    writeLocalStorage('k', 'v');

    expect(window.localStorage.getItem('k')).toBe('v');
  });

  it('removes the key when the value is undefined', () => {
    window.localStorage.setItem('k', 'v');

    writeLocalStorage('k', undefined);

    expect(window.localStorage.getItem('k')).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => writeLocalStorage('k', 'v')).not.toThrow();
  });
});
