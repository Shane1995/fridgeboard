import { refreshSession } from '../../session/refreshSession';
import { UNAUTHORISED_STATUS } from '../../constants';
import { API_PREFIX, OUTSIDE_API_ERROR } from '../constants';
import { sendRequest } from './utils/sendRequest';

export const apiFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  if (!path.startsWith(API_PREFIX)) {
    throw new Error(OUTSIDE_API_ERROR);
  }

  const response = await sendRequest(path, init);
  if (response.status !== UNAUTHORISED_STATUS || !(await refreshSession())) {
    return response;
  }
  return sendRequest(path, init);
};
