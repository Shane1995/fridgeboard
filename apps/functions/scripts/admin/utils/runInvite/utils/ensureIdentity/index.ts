import { ensureEmailIdentity } from '../../../../../../src/utils/ensureEmailIdentity/index.ts';
import { ses } from '../../../clients/index.ts';
import type { InviteResult } from '../../types.ts';

export const ensureIdentity = (emailIdentity: string): Promise<InviteResult['identity']> =>
  ensureEmailIdentity({ ses, emailIdentity });
