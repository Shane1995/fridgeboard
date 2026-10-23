import type { Endpoint } from '../../configuration/types';
import type { IPasskeyCredentialRequest } from '@fridgeboard/contract/auth';
import type { AuthenticationResponseJSON } from '@simplewebauthn/browser';
import { request } from '../../api/request';
import { POST, UNKNOWN_REASON } from '../constants';
import type { VerifyResponse } from '../types';
import { isTokenResponse } from '../utils/isTokenResponse';
import { readFailureReason } from '../utils/readFailureReason';

export const verifyPasskey = async (
  endpoint: Endpoint,
  credential: AuthenticationResponseJSON,
): Promise<VerifyResponse> => {
  const payload: IPasskeyCredentialRequest = { credential: { ...credential } };
  const response = await request(endpoint, { method: POST, body: JSON.stringify(payload) });
  if (!response.ok) {
    return { ok: false, reason: await readFailureReason(response) };
  }

  const body: unknown = await response.json().catch(() => undefined);
  return isTokenResponse(body) ? { ok: true, tokens: body } : { ok: false, reason: UNKNOWN_REASON };
};
