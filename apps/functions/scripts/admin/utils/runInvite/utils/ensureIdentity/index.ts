import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  NotFoundException,
} from '@aws-sdk/client-sesv2';
import { ses } from '../../../clients/index.ts';
import type { InviteResult } from '../../types.ts';

export const ensureIdentity = async (EmailIdentity: string): Promise<InviteResult['identity']> => {
  const existing = await ses
    .send(new GetEmailIdentityCommand({ EmailIdentity }))
    .catch((error: unknown) => {
      if (error instanceof NotFoundException) {
        return undefined;
      }
      throw error;
    });
  if (!existing) {
    await ses.send(new CreateEmailIdentityCommand({ EmailIdentity }));
    return 'created';
  }
  if (existing.VerifiedForSendingStatus) {
    return 'verified';
  }
  await ses.send(new DeleteEmailIdentityCommand({ EmailIdentity }));
  await ses.send(new CreateEmailIdentityCommand({ EmailIdentity }));
  return 'recreated';
};
