import type { CookieName } from './types.ts';

export const REFRESH_COOKIE: CookieName = 'fb_rt';
export const FLOW_COOKIE: CookieName = 'fb_auth_flow';
export const REFRESH_MAX_AGE = 315360000;
export const COOKIE_ATTRIBUTES = 'Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth';
