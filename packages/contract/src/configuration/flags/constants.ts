export enum WebFeatureFlag {
  ENABLE_ADMIN_INVITES = 'ENABLE_ADMIN_INVITES',
}

export enum LambdaFeatureFlag {}

export const WEB_FEATURE_FLAGS: readonly string[] = Object.values(WebFeatureFlag);

export const LAMBDA_FEATURE_FLAGS: readonly string[] = Object.values(LambdaFeatureFlag);

export const DEFAULT_WEB_FLAGS: Record<WebFeatureFlag, boolean> = {
  [WebFeatureFlag.ENABLE_ADMIN_INVITES]: false,
};

export const DEFAULT_LAMBDA_FLAGS: Record<LambdaFeatureFlag, boolean> = {};
