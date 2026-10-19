import { CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE, SAME_ORIGIN } from '../../constants';
import { API_PREFIX, AUTHORIZATION_HEADER, BEARER_PREFIX, OUTSIDE_API_ERROR } from '../constants';

export const request = async (
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<Response> => {
  if (!path.startsWith(API_PREFIX)) {
    throw new Error(OUTSIDE_API_ERROR);
  }

  const headers = new Headers(init.headers);
  if (!headers.has(CONTENT_TYPE_HEADER)) {
    headers.set(CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE);
  }
  if (token) {
    headers.set(AUTHORIZATION_HEADER, `${BEARER_PREFIX}${token}`);
  }
  return fetch(path, { ...init, credentials: SAME_ORIGIN, headers });
};
