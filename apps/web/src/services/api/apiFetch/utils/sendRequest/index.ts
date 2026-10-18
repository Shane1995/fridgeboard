import { CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE, SAME_ORIGIN } from '../../../../constants';
import { getAccessToken } from '../../../../session/getAccessToken';
import { AUTHORIZATION_HEADER, BEARER_PREFIX } from '../../../constants';

export const sendRequest = (path: string, init: RequestInit): Promise<Response> => {
  const headers = new Headers(init.headers);
  if (!headers.has(CONTENT_TYPE_HEADER)) {
    headers.set(CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE);
  }
  const token = getAccessToken();
  if (token) {
    headers.set(AUTHORIZATION_HEADER, `${BEARER_PREFIX}${token}`);
  }
  return fetch(path, { ...init, credentials: SAME_ORIGIN, headers });
};
