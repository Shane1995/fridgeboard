import type { WEB_SERVICE } from './constants.ts';

export type WebService = (typeof WEB_SERVICE)[keyof typeof WEB_SERVICE];
