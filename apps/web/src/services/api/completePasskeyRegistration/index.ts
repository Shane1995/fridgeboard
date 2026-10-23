import type { Endpoint } from '../../configuration/types';
import type { IPasskeyCredentialRequest } from '@fridgeboard/contract/auth';
import type { RegistrationResponseJSON } from '@simplewebauthn/browser';
import { POST } from '../../session/constants';
import { readFailureReason } from '../../session/utils/readFailureReason';
import type { CompletePasskeyRegistrationResult } from './types';

export const completePasskeyRegistration = async (
  endpoint: Endpoint,
  credential: RegistrationResponseJSON,
  fetcher: (endpoint: Endpoint, init: RequestInit) => Promise<Response>,
): Promise<CompletePasskeyRegistrationResult> => {
  const payload: IPasskeyCredentialRequest = { credential: { ...credential } };
  const response = await fetcher(endpoint, { method: POST, body: JSON.stringify(payload) });
  return response.ok ? { ok: true } : { ok: false, reason: await readFailureReason(response) };
};
