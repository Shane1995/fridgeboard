import { PLACEHOLDER_PATTERN } from '../base/constants.ts';
import type { ServiceDefinition } from './types.ts';

const RESOLVED_PREFIX = '/api/';

export const resolveServiceUrl = (
  service: ServiceDefinition,
  values: Record<string, string> = {},
): string => {
  const merged = { ...service.params, ...values };

  const resolved = service.url.replace(PLACEHOLDER_PATTERN, (_match, name: string) => {
    const value = merged[name];
    if (value === undefined) {
      throw new Error(`Unresolved placeholder {${name}} in service url`);
    }
    return encodeURIComponent(value);
  });

  if (!resolved.startsWith(RESOLVED_PREFIX) || resolved.includes('..')) {
    throw new Error('Resolved service url is not a safe api path');
  }
  return resolved;
};
