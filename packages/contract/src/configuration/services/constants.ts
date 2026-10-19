import type { ServiceDefinition } from '../resolveServiceUrl/types.ts';

export enum WebService {
  start = 'start',
  verify = 'verify',
  refresh = 'refresh',
  signOut = 'signOut',
  me = 'me',
}

export const WEB_SERVICES = Object.values(WebService);

export const DEFAULT_WEB_PARAMS: Record<string, string> = { version: 'v1' };

export const DEFAULT_WEB_SERVICES: Record<WebService, ServiceDefinition> = {
  [WebService.start]: { url: '/api/{version}/auth/start' },
  [WebService.verify]: { url: '/api/{version}/auth/verify' },
  [WebService.refresh]: { url: '/api/{version}/auth/refresh' },
  [WebService.signOut]: { url: '/api/{version}/auth/sign-out' },
  [WebService.me]: { url: '/api/{version}/me' },
};
