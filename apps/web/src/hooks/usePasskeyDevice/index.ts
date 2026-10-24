import { useCallback } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import { DISMISSED, PASSKEY_EMAIL_KEY, PASSKEY_PROMPT_DISMISSED_KEY } from './constants';
import type { PasskeyDevice } from './types';

export const usePasskeyDevice = (): PasskeyDevice => {
  const [email, setEmail] = useLocalStorage(PASSKEY_EMAIL_KEY);
  const [dismissed, setDismissed] = useLocalStorage(PASSKEY_PROMPT_DISMISSED_KEY);

  const forget = useCallback(() => setEmail(undefined), [setEmail]);
  const dismissPrompt = useCallback(() => setDismissed(DISMISSED), [setDismissed]);

  return {
    email,
    promptDismissed: dismissed === DISMISSED,
    remember: setEmail,
    forget,
    dismissPrompt,
  };
};
