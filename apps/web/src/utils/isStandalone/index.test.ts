import { isStandalone } from './index';

const stubMatchMedia = (matches: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches && query.includes('standalone'),
  }));

describe('isStandalone', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is true in display-mode standalone', () => {
    stubMatchMedia(true);
    expect(isStandalone()).toBe(true);
  });

  it('is false in a browser tab', () => {
    stubMatchMedia(false);
    expect(isStandalone()).toBe(false);
  });

  it('is false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(isStandalone()).toBe(false);
  });
});
