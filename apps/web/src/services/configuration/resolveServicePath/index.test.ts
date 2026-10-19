import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import { DEFAULT_WEB_SERVICES } from '@fridgeboard/contract/configuration/services/constants';
import { resolveServicePath } from '.';

describe('resolveServicePath', () => {
  it('resolves the default path', () => {
    expect(resolveServicePath(DEFAULT_WEB_SERVICES, WebService.signOut)).toBe(
      '/api/v1/auth/sign-out',
    );
  });

  it('follows a served version bump', () => {
    const services = {
      ...DEFAULT_WEB_SERVICES,
      me: { url: '/api/{version}/me', params: { version: 'v2' } },
    };

    expect(resolveServicePath(services, WebService.me)).toBe('/api/v2/me');
  });

  it('falls back to the default path when a url has an unresolved placeholder', () => {
    const services = {
      ...DEFAULT_WEB_SERVICES,
      refresh: { url: '/api/{missing}/auth/refresh' },
    };

    expect(resolveServicePath(services, WebService.refresh)).toBe('/api/v1/auth/refresh');
  });

  it('falls back to the default path when a url is not a safe api path', () => {
    const services = { ...DEFAULT_WEB_SERVICES, verify: { url: 'https://evil.example/verify' } };

    expect(resolveServicePath(services, WebService.verify)).toBe('/api/v1/auth/verify');
  });
});
