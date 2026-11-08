import { ensureEmailIdentity } from '@fridgeboard/lambda-kit/utils/ensureEmailIdentity/index.ts';
import { ses } from '../../../clients/index.ts';
import type { InviteResult } from '../../types.ts';

export const ensureIdentity = (emailIdentity: string): Promise<InviteResult['identity']> =>
  ensureEmailIdentity({ ses, emailIdentity });
