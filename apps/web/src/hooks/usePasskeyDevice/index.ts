import { useCallback, useState } from 'react';
import { readStorage } from '../../services/storage/readStorage';
import { writeStorage } from '../../services/storage/writeStorage';
import { DISMISSED, PASSKEY_EMAIL_KEY, PASSKEY_PROMPT_DISMISSED_KEY } from './constants';
import type { PasskeyDevice } from './types';

export const usePasskeyDevice = (): PasskeyDevice => {
  const [email, setEmail] = useState(() => readStorage(PASSKEY_EMAIL_KEY));
  const [promptDismissed, setPromptDismissed] = useState(
    () => readStorage(PASSKEY_PROMPT_DISMISSED_KEY) === DISMISSED,
  );

  const remember = useCallback((value: string) => {
    writeStorage(PASSKEY_EMAIL_KEY, value);
    setEmail(value);
  }, []);

  const forget = useCallback(() => {
    writeStorage(PASSKEY_EMAIL_KEY, undefined);
    setEmail(undefined);
  }, []);

  const dismissPrompt = useCallback(() => {
    writeStorage(PASSKEY_PROMPT_DISMISSED_KEY, DISMISSED);
    setPromptDismissed(true);
  }, []);

  return { email, promptDismissed, remember, forget, dismissPrompt };
};
