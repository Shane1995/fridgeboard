import { retryUnlessClientError } from './index';

const failed = (status?: number) =>
  new Error('request failed', status === undefined ? {} : { cause: status });

describe('retryUnlessClientError', () => {
  it('retries a network error up to the configured count', () => {
    const shouldRetry = retryUnlessClientError(2);

    expect(shouldRetry(0, new TypeError('offline'))).toBe(true);
    expect(shouldRetry(1, new TypeError('offline'))).toBe(true);
    expect(shouldRetry(2, new TypeError('offline'))).toBe(false);
  });

  it.each([500, 502, 503])('retries a %s response', (status) => {
    expect(retryUnlessClientError(1)(0, failed(status))).toBe(true);
  });

  it.each([400, 401, 403, 404, 409, 429])('does not retry a %s response', (status) => {
    expect(retryUnlessClientError(3)(0, failed(status))).toBe(false);
  });

  it('never retries when the count is zero', () => {
    expect(retryUnlessClientError(0)(0, failed(503))).toBe(false);
  });
});
