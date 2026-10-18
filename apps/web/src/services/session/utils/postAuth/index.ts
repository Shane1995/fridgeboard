import { JSON_HEADERS, POST, SAME_ORIGIN } from '../../constants';

export const postAuth = (path: string, body?: object): Promise<Response> =>
  fetch(path, {
    method: POST,
    credentials: SAME_ORIGIN,
    headers: { ...JSON_HEADERS },
    ...(body && { body: JSON.stringify(body) }),
  });
