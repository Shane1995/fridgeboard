import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { normaliseEmail } from '../../../../src/utils/normaliseEmail/index.ts';
import { buildInvite } from '../../../../src/utils/buildInvite/index.ts';
import { TABLE_NAME } from '../clients/constants.ts';
import { doc } from '../clients/index.ts';
import { joinLink } from '../joinLink/index.ts';
import { INVITED_BY_ADMIN } from './constants.ts';
import type { InviteOptions, InviteResult } from './types.ts';
import { ensureIdentity } from './utils/ensureIdentity/index.ts';

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
      Item: buildInvite({
        email: normalised,
        app,
        admin,
        household,
        invitedBy: INVITED_BY_ADMIN,
        now,
      }),
    }),
  );
  return { link: joinLink(normalised), identity: await ensureIdentity(normalised) };
};
