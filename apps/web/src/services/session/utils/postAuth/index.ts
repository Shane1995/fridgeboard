import { JSON_HEADERS, SAME_ORIGIN } from '../../../constants';
import { POST } from '../../constants';

export const postAuth = (path: string, body?: object): Promise<Response> =>
  fetch(path, {
    method: POST,
    credentials: SAME_ORIGIN,
    headers: { ...JSON_HEADERS },
    ...(body && { body: JSON.stringify(body) }),
  });
