import type { LAMBDA_SETTING } from './constants.ts';

export type LambdaSetting = (typeof LAMBDA_SETTING)[keyof typeof LAMBDA_SETTING];

export type LambdaSettings = Record<LambdaSetting, number>;
