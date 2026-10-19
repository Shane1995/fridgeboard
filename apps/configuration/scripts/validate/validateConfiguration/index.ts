import { findSecrets } from '../findSecrets/index.ts';
import type { ConfigurationTarget } from '../types.ts';

export const validateConfiguration = (
  target: Pick<ConfigurationTarget, 'name' | 'schema'>,
  raw: string,
): string[] => {
  const parsed = ((): { value: unknown } | { error: string } => {
    try {
      return { value: JSON.parse(raw) };
    } catch {
      return { error: 'invalid JSON' };
    }
  })();

  if ('error' in parsed) {
    return [`${target.name}: ${parsed.error}`];
  }

  const result = target.schema.safeParse(parsed.value);
  const schemaErrors = result.success
    ? []
    : result.error.issues.map(
        (issue) => `${target.name}: ${issue.path.join('.')} ${issue.message}`,
      );

  return [...schemaErrors, ...findSecrets(parsed.value).map((issue) => `${target.name}: ${issue}`)];
};
