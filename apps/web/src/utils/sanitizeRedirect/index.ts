import {
  BACKSLASH,
  DEFAULT_REDIRECT,
  DELETE_CODE,
  FALLBACK_ORIGIN,
  LAST_CONTROL_CODE,
} from './constants';

const isUnsafeChar = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return char === BACKSLASH || code <= LAST_CONTROL_CODE || code === DELETE_CODE;
};

const isSameOriginPath = (value: string): boolean =>
  value.startsWith('/') &&
  !value.startsWith('//') &&
  ![...value].some(isUnsafeChar) &&
  new URL(value, FALLBACK_ORIGIN).origin === FALLBACK_ORIGIN;

export const sanitizeRedirect = (value: unknown): string =>
  typeof value === 'string' && isSameOriginPath(value) ? value : DEFAULT_REDIRECT;
