import type { WEB_SETTING } from './constants';

export type WebSetting = (typeof WEB_SETTING)[keyof typeof WEB_SETTING];

export type WebSettings = Record<WebSetting, number>;
