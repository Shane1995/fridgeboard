import { serialiseCookie } from '../serialiseCookie/index.ts';
import type { CookieName } from '../types.ts';

export const clearCookie = (name: CookieName): string => serialiseCookie(name, '', 0);
