export enum LambdaFeatureFlag {}

export const LAMBDA_FEATURE_FLAGS: readonly string[] = Object.values(LambdaFeatureFlag);

export const DEFAULT_LAMBDA_FLAGS: Record<LambdaFeatureFlag, boolean> = {};
