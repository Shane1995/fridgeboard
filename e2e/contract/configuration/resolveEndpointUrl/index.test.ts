import { WebService } from '../../../../packages/contract/src/configuration/services/constants.ts';
import type { ApiService } from '../../../../packages/contract/src/configuration/services/types.ts';
import { resolveEndpointUrl } from '../../../../packages/contract/src/configuration/resolveEndpointUrl/index.ts';

const API = {
  basePath: '/api/{version}',
  endpoints: { requestCode: '/auth/start', me: '/me' },
  params: { version: 'v1' },
} as unknown as ApiService;

describe('resolveEndpointUrl', () => {
  it('joins the base path and endpoint and fills the version', () => {
    expect(resolveEndpointUrl(API, WebService.requestCode)).toBe('/api/v1/auth/start');
    expect(resolveEndpointUrl(API, WebService.me)).toBe('/api/v1/me');
  });

  it('throws when the resolved path is not under /api/', () => {
    expect(() =>
      resolveEndpointUrl({ ...API, basePath: '/other/{version}' }, WebService.me),
    ).toThrow('safe api path');
  });
});
