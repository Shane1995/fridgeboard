import { ALLOWED_SERVICE_HOSTS } from '../constants.ts';
import { HTTPS_HOST_PATTERN } from './constants.ts';

export const isAllowedServiceUrl = (value: string): boolean => {
  const host = HTTPS_HOST_PATTERN.exec(value)?.[1];
  return host !== undefined && ALLOWED_SERVICE_HOSTS.includes(host);
};
