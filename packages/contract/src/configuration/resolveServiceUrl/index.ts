import { PLACEHOLDER_PATTERN } from '../base/constants.ts';
import type { ServiceDefinition } from './types.ts';

export const resolveServiceUrl = (
  service: ServiceDefinition,
  values: Record<string, string> = {},
): string => {
  const merged = { ...service.params, ...values };

  return service.url.replace(PLACEHOLDER_PATTERN, (_match, name: string) => {
    const value = merged[name];
    if (value === undefined) {
      throw new Error(`Unresolved placeholder {${name}} in service url`);
    }
    return encodeURIComponent(value);
  });
};
