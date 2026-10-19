import { writeStorage } from '.';

describe('writeStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores a value', () => {
    writeStorage('k', 'v');

    expect(window.localStorage.getItem('k')).toBe('v');
  });

  it('removes the key when the value is undefined', () => {
    window.localStorage.setItem('k', 'v');

    writeStorage('k', undefined);

    expect(window.localStorage.getItem('k')).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => writeStorage('k', 'v')).not.toThrow();
  });
});
