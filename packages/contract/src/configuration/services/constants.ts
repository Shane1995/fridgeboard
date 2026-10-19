import type { ServiceDefinition } from '../resolveServiceUrl/types.ts';

export enum WebService {
  start = 'start',
  verify = 'verify',
  refresh = 'refresh',
  signOut = 'signOut',
  me = 'me',
  username = 'username',
}

export const WEB_SERVICES = Object.values(WebService);

const DEFAULT_SERVICE_PARAMS: Record<string, string> = { version: 'v1' };

export const DEFAULT_WEB_SERVICES: Record<WebService, ServiceDefinition> = {
  [WebService.start]: {
    url: '/api/{version}/auth/start',
    params: DEFAULT_SERVICE_PARAMS,
  },
  [WebService.verify]: {
    url: '/api/{version}/auth/verify',
    params: DEFAULT_SERVICE_PARAMS,
  },
  [WebService.refresh]: {
    url: '/api/{version}/auth/refresh',
    params: DEFAULT_SERVICE_PARAMS,
  },
  [WebService.signOut]: {
    url: '/api/{version}/auth/sign-out',
    params: DEFAULT_SERVICE_PARAMS,
  },
  [WebService.me]: { url: '/api/{version}/me', params: DEFAULT_SERVICE_PARAMS },
  [WebService.username]: { url: '/api/{version}/me/username', params: DEFAULT_SERVICE_PARAMS },
};
