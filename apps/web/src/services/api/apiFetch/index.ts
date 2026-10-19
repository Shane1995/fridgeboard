import { SessionStatus } from '../../session/constants';
import { getSessionStatus } from '../../session/getSessionStatus';
import { UNAUTHORISED_STATUS } from '../../constants';
import { API_PREFIX, OUTSIDE_API_ERROR } from '../constants';
import { sendRequest } from './utils/sendRequest';

export const apiFetch = async (
  path: string,
  refresh: () => Promise<boolean>,
  init: RequestInit = {},
): Promise<Response> => {
  if (!path.startsWith(API_PREFIX)) {
    throw new Error(OUTSIDE_API_ERROR);
  }

  const response = await sendRequest(path, init);
  if (
    response.status !== UNAUTHORISED_STATUS ||
    getSessionStatus() === SessionStatus.SignedOut ||
    !(await refresh())
  ) {
    return response;
  }
  return sendRequest(path, init);
};
