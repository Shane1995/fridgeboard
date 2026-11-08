export const LAMBDAS_DIR = 'apps/functions';
export const LAMBDA_KINDS = [
  'wrapped',
  'pre-sign-up',
  'post-confirmation',
  'subscribe-guard',
] as const;
export const DEFAULT_KIND = 'wrapped';
export const NAME_PATTERN = /^[a-z][A-Za-z0-9]*$/;
export const USAGE =
  'Usage: new-lambda <camelCaseName> [wrapped|pre-sign-up|post-confirmation|subscribe-guard]';
export const FUNCTION_PREFIX = 'fridgeboard-';
export const PACKAGE_PREFIX = '@fridgeboard/fn-';
export const BASE_DEV_DEPENDENCIES = {
  '@fridgeboard/lambda-tooling': 'workspace:*',
  '@types/node': '^26.6.5',
  typescript: '^7.0.2',
  vitest: '^5.0.5',
};
