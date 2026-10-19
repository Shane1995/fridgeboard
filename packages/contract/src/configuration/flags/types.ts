import type { LAMBDA_FEATURE_FLAG, WEB_FEATURE_FLAG } from './constants.ts';

export type WebFeatureFlag = (typeof WEB_FEATURE_FLAG)[keyof typeof WEB_FEATURE_FLAG];

export type LambdaFeatureFlag = (typeof LAMBDA_FEATURE_FLAG)[keyof typeof LAMBDA_FEATURE_FLAG];
