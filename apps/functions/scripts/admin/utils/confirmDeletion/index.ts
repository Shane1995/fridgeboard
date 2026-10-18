import { normaliseEmail } from '../../../../src/utils/normaliseEmail/index.ts';

export const confirmDeletion = async (
  email: string,
  ask: (question: string) => Promise<string>,
): Promise<boolean> =>
  normaliseEmail(
    await ask(`Permanently delete ${email} and their data? Re-type the email to confirm: `),
  ) === normaliseEmail(email);
