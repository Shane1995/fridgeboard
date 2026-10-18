import { normaliseEmail } from '../../../../src/utils/normaliseEmail/index.ts';
import type { Ask } from './types.ts';

export const confirmDeletion = async (email: string, ask: Ask): Promise<boolean> =>
  normaliseEmail(
    await ask(`Permanently delete ${email} and their data? Re-type the email to confirm: `),
  ) === normaliseEmail(email);
