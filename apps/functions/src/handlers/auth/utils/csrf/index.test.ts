import { isTrustedRequest } from './index.ts';

const ORIGIN = 'https://app.fridgeboard.uk';

describe('isTrustedRequest', () => {
  it('accepts the app origin with a JSON content type and charset', () => {
    expect(
      isTrustedRequest(
        { origin: ORIGIN, 'content-type': 'application/json; charset=utf-8' },
        ORIGIN,
      ),
    ).toBe(true);
  });

  it('rejects a missing origin', () => {
    expect(isTrustedRequest({ 'content-type': 'application/json' }, ORIGIN)).toBe(false);
  });

  it('rejects a foreign origin', () => {
    expect(
      isTrustedRequest(
        { origin: 'https://evil.example', 'content-type': 'application/json' },
        ORIGIN,
      ),
    ).toBe(false);
  });

  it('rejects a text/plain content type', () => {
    expect(isTrustedRequest({ origin: ORIGIN, 'content-type': 'text/plain' }, ORIGIN)).toBe(false);
  });

  it('rejects a missing content type', () => {
    expect(isTrustedRequest({ origin: ORIGIN }, ORIGIN)).toBe(false);
  });

  it('rejects everything when the trusted origin is not configured', () => {
    expect(isTrustedRequest({ origin: '', 'content-type': 'application/json' }, '')).toBe(false);
  });
});
