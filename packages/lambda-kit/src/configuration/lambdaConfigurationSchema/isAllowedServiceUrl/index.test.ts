import { isAllowedServiceUrl } from './index.ts';

vi.mock('../constants.ts', () => ({
  ALLOWED_SERVICE_HOSTS: ['api.example.com'],
}));

describe('isAllowedServiceUrl', () => {
  it.each([
    'https://api.example.com',
    'https://api.example.com/x?y=1',
    'https://api.example.com#f',
  ])('allows %s', (url) => {
    expect(isAllowedServiceUrl(url)).toBe(true);
  });

  it.each([
    'http://api.example.com/x',
    'https://other.example.com/x',
    'https://api.example.com.evil.io/x',
    'https://user@api.example.com/x',
    '/relative',
  ])('rejects %s', (url) => {
    expect(isAllowedServiceUrl(url)).toBe(false);
  });
});
