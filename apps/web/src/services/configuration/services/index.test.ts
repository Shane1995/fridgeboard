import { WEB_SERVICES } from './constants';
import { ApiServiceSchema } from '.';

const endpoints = Object.fromEntries(WEB_SERVICES.map((name) => [name, `/${name}`]));
const VALID = { basePath: '/api/{version}', endpoints, params: { version: 'v1' } };

describe('ApiServiceSchema', () => {
  it('accepts a complete service', () => {
    expect(ApiServiceSchema.safeParse(VALID).success).toBe(true);
  });

  it.each(['/other/{version}', '//evil.com/api/', '/api/../x', 'api/{version}'])(
    'rejects the base path %s',
    (basePath) => {
      expect(ApiServiceSchema.safeParse({ ...VALID, basePath }).success).toBe(false);
    },
  );

  it.each(['me', '//me', '/me?x=1', '/me/../x'])('rejects the endpoint path %s', (path) => {
    expect(
      ApiServiceSchema.safeParse({ ...VALID, endpoints: { ...endpoints, me: path } }).success,
    ).toBe(false);
  });

  it('rejects a missing endpoint, an unknown endpoint and a bad version', () => {
    const { me: _me, ...missing } = endpoints;

    expect(ApiServiceSchema.safeParse({ ...VALID, endpoints: missing }).success).toBe(false);
    expect(
      ApiServiceSchema.safeParse({ ...VALID, endpoints: { ...endpoints, nope: '/nope' } }).success,
    ).toBe(false);
    expect(ApiServiceSchema.safeParse({ ...VALID, params: { version: 'v 1' } }).success).toBe(
      false,
    );
  });

  it('accepts a per-endpoint timeout inside the bounds only', () => {
    const withTimeout = (timeoutMs: number) => ({
      ...VALID,
      endpointsConfig: { me: { timeoutMs } },
    });

    expect(ApiServiceSchema.safeParse(withTimeout(5_000)).success).toBe(true);
    expect(ApiServiceSchema.safeParse(withTimeout(500)).success).toBe(false);
  });
});
