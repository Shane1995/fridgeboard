import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  NotFoundException,
} from '@aws-sdk/client-sesv2';
import type { EmailIdentityState, EnsureEmailIdentityOptions } from './types.ts';

export const ensureEmailIdentity = async ({
  ses,
  emailIdentity,
}: EnsureEmailIdentityOptions): Promise<EmailIdentityState> => {
  const existing = await ses
    .send(new GetEmailIdentityCommand({ EmailIdentity: emailIdentity }))
    .catch((error: unknown) => {
      if (error instanceof NotFoundException) {
        return undefined;
      }
      throw error;
    });
  if (!existing) {
    await ses.send(new CreateEmailIdentityCommand({ EmailIdentity: emailIdentity }));
    return 'created';
  }
  if (existing.VerifiedForSendingStatus) {
    return 'verified';
  }
  await ses.send(new DeleteEmailIdentityCommand({ EmailIdentity: emailIdentity }));
  await ses.send(new CreateEmailIdentityCommand({ EmailIdentity: emailIdentity }));
  return 'recreated';
};
