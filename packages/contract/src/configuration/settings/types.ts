import type { LAMBDA_SETTING, WEB_SETTING } from './constants.ts';

export type WebSetting = (typeof WEB_SETTING)[keyof typeof WEB_SETTING];

export type LambdaSetting = (typeof LAMBDA_SETTING)[keyof typeof LAMBDA_SETTING];

export type WebSettings = Record<WebSetting, number>;

export type LambdaSettings = Record<LambdaSetting, number>;
