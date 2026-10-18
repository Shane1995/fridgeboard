import { AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { normaliseEmail } from '../../../../src/utils/normaliseEmail/index.ts';
import { cognito } from '../clients/index.ts';
import { loadUserPoolId } from '../loadUserPoolId/index.ts';
import { NO_SUB_ERROR, SUB_ATTRIBUTE } from './constants.ts';
import type { ResolvedUser } from './types.ts';

export const resolveUser = async (email: string): Promise<ResolvedUser> => {
  const userPoolId = await loadUserPoolId();
  const username = normaliseEmail(email);
  const { UserAttributes = [] } = await cognito.send(
    new AdminGetUserCommand({ UserPoolId: userPoolId, Username: username }),
  );
  const sub = UserAttributes.find((attribute) => attribute.Name === SUB_ATTRIBUTE)?.Value;
  if (!sub) {
    throw new Error(NO_SUB_ERROR);
  }
  return { userPoolId, username, sub };
};
