import type { LambdaFeatureFlag, WebFeatureFlag } from './types.ts';

export const WEB_FEATURE_FLAG = {
  ENABLE_ADMIN_INVITES: 'ENABLE_ADMIN_INVITES',
} as const;

export const LAMBDA_FEATURE_FLAG = {} as const;

export const WEB_FEATURE_FLAGS = Object.values(WEB_FEATURE_FLAG);

export const LAMBDA_FEATURE_FLAGS: readonly string[] = Object.values(LAMBDA_FEATURE_FLAG);

export const DEFAULT_WEB_FLAGS: Record<WebFeatureFlag, boolean> = {
  ENABLE_ADMIN_INVITES: false,
};

export const DEFAULT_LAMBDA_FLAGS: Record<LambdaFeatureFlag, boolean> = {};
