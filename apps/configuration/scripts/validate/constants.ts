import { resolve } from 'node:path';
import { LambdaConfigurationSchema } from '@fridgeboard/contract/configuration/lambda';
import { WebConfigurationSchema } from '@fridgeboard/contract/configuration/web';
import type { ConfigurationTarget } from './types.ts';

const ROOT = resolve(import.meta.dirname, '../..');

export const TARGETS: readonly ConfigurationTarget[] = [
  { name: 'web', file: resolve(ROOT, 'web/configuration.json'), schema: WebConfigurationSchema },
  {
    name: 'lambda',
    file: resolve(ROOT, 'lambda/configuration.json'),
    schema: LambdaConfigurationSchema,
  },
];

export const SECRET_VALUE_PATTERNS: readonly RegExp[] = [/AKIA[0-9A-Z]{16}/, /-----BEGIN/];
export const SECRET_KEY_PATTERN = /secret|token|password/i;
