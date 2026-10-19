import { resolveServiceUrl } from '@fridgeboard/contract/configuration/resolveServiceUrl';
import {
  DEFAULT_WEB_SERVICES,
  type WebService,
} from '@fridgeboard/contract/configuration/services/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';

export const resolveServicePath = (
  services: WebConfiguration['services'],
  service: WebService,
): string => {
  try {
    return resolveServiceUrl(services[service], {});
  } catch {
    return resolveServiceUrl(DEFAULT_WEB_SERVICES[service], {});
  }
};
