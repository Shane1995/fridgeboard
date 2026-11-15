import type { WebAuthnOptions } from '@fridgeboard/contract/auth';

export const parseOptions = (raw: string | undefined): WebAuthnOptions | undefined => {
  try {
    const parsed: unknown = JSON.parse(raw ?? '');
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? Object.fromEntries(Object.entries(parsed))
      : undefined;
  } catch {
    return undefined;
  }
};
