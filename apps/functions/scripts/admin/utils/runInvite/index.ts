import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  NotFoundException,
} from '@aws-sdk/client-sesv2';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { normaliseEmail } from '../../../../src/utils/normaliseEmail/index.ts';
import { buildInvite } from '../buildInvite/index.ts';
import { doc, ses, TABLE_NAME } from '../clients/index.ts';
import { joinLink } from '../joinLink/index.ts';
import type { InviteOptions, InviteResult } from './types.ts';

export type { InviteResult } from './types.ts';

const ensureIdentity = async (EmailIdentity: string): Promise<InviteResult['identity']> => {
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

export const runInvite = async ({
  email,
  app,
  admin,
  household,
  now,
}: InviteOptions): Promise<InviteResult> => {
  const normalised = normaliseEmail(email);
  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: buildInvite({ email: normalised, app, admin, household, invitedBy: 'admin', now }),
    }),
  );
  return { link: joinLink(normalised), identity: await ensureIdentity(normalised) };
};
