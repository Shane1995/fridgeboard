import { useState, type FormEvent } from 'react';
import { useRemoteConfigContext } from '../../../../../../hooks/useRemoteConfigContext';
import { useSetUsernameMutation } from '../../../../../../hooks/useSetUsernameMutation';
import { FailureReason } from '../../../../../../services/session/constants';
import { ONBOARDING_COPY } from '../../../../constants';
import type { UsernameStepState } from './types';

const COPY = ONBOARDING_COPY.username;

export const useUsernameStep = (): UsernameStepState => {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const save = useSetUsernameMutation();
  const { usernameMinLength, usernameMaxLength } = useRemoteConfigContext().settings;

  const handleSubmit = (event: Pick<FormEvent, 'preventDefault'>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    save.mutate(username.trim(), {
      onSuccess: (result) => !result.ok && setErrorMessage(COPY.reasons[result.reason]),
      onError: () => setErrorMessage(COPY.reasons[FailureReason.Unknown]),
    });
  };

  return {
    username,
    setUsername,
    errorMessage,
    isSaving: save.isPending,
    minLength: usernameMinLength,
    maxLength: usernameMaxLength,
    handleSubmit,
  };
};
