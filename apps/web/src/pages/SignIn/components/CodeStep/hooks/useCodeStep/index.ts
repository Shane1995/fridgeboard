import { useState, type FormEvent } from 'react';
import { useStartSignInMutation } from '../../../../../../hooks/useStartSignInMutation';
import { useVerifyCodeMutation } from '../../../../../../hooks/useVerifyCodeMutation';
import { SIGN_IN_COPY } from '../../../../constants';
import { UNKNOWN_FEEDBACK } from '../../constants';
import type { CodeFeedback, CodeStepProps } from '../../types';
import { toVerifyFeedback } from '../../utils/toVerifyFeedback';
import type { CodeStepState } from './types';

export const useCodeStep = ({
  email,
  onSignedIn,
}: Pick<CodeStepProps, 'email' | 'onSignedIn'>): CodeStepState => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<CodeFeedback | undefined>();
  const verify = useVerifyCodeMutation();
  const resend = useStartSignInMutation();

  const handleSubmit = (event: Pick<FormEvent, 'preventDefault'>) => {
    event.preventDefault();
    setFeedback(undefined);
    verify.mutate(code.trim(), {
      onSuccess: (result) => {
        if (result.ok) {
          onSignedIn();
          return;
        }
        if ('next' in result) {
          setCode('');
        }
        setFeedback(toVerifyFeedback(result));
      },
      onError: () => setFeedback(UNKNOWN_FEEDBACK),
    });
  };

  const handleResend = () => {
    setFeedback(undefined);
    resend.mutate(email, {
      onSuccess: (result) => {
        setCode('');
        setFeedback(
          result.ok
            ? { message: SIGN_IN_COPY.resent, isError: false, isExpired: false }
            : { message: SIGN_IN_COPY.reasons[result.reason], isError: true, isExpired: false },
        );
      },
      onError: () => setFeedback(UNKNOWN_FEEDBACK),
    });
  };

  return {
    code,
    setCode,
    feedback,
    isVerifying: verify.isPending,
    isResending: resend.isPending,
    handleSubmit,
    handleResend,
  };
};
