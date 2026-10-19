import type { ServiceDefinition } from '../resolveServiceUrl/types.ts';
import type { WebService } from './types.ts';

export const WEB_SERVICE = {
  start: 'start',
  verify: 'verify',
  refresh: 'refresh',
  signOut: 'signOut',
  me: 'me',
} as const;

export const WEB_SERVICES = Object.values(WEB_SERVICE);

export const DEFAULT_WEB_PARAMS: Record<string, string> = { version: 'v1' };

export const DEFAULT_WEB_SERVICES: Record<WebService, ServiceDefinition> = {
  start: { url: '/api/{version}/auth/start' },
  verify: { url: '/api/{version}/auth/verify' },
  refresh: { url: '/api/{version}/auth/refresh' },
  signOut: { url: '/api/{version}/auth/sign-out' },
  me: { url: '/api/{version}/me' },
};
