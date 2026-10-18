import { AdminUserGlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognito } from '../clients/index.ts';
import { resolveUser } from '../resolveUser/index.ts';

export const runSignOutEverywhere = async (email: string): Promise<void> => {
  const { userPoolId, username } = await resolveUser(email);
  await cognito.send(
    new AdminUserGlobalSignOutCommand({ UserPoolId: userPoolId, Username: username }),
  );
};
