import { Alert, Button, Input, Label, TextField } from '@heroui/react';
import { useState, type FormEvent } from 'react';
import { useStartSignInMutation } from '../../../../hooks/useStartSignInMutation';
import { useVerifyCodeMutation } from '../../../../hooks/useVerifyCodeMutation';
import { CODE_PATTERN, SIGN_IN_COPY } from '../../constants';
import { UNKNOWN_FEEDBACK } from './constants';
import type { CodeFeedback, CodeStepProps } from './types';
import { toVerifyFeedback } from './utils/toVerifyFeedback';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';

export const CodeStep = ({ email, onSignedIn, onBack }: CodeStepProps) => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<CodeFeedback | undefined>();
  const verify = useVerifyCodeMutation();
  const resend = useStartSignInMutation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Typography variant={TypographyVariant.Heading2}>{SIGN_IN_COPY.codeTitle}</Typography>
      <Typography>
        {SIGN_IN_COPY.codeIntro} <Typography variant={TypographyVariant.Strong}>{email}</Typography>
      </Typography>
      <TextField
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern={CODE_PATTERN}
        isRequired
        value={code}
        onChange={setCode}
      >
        <Label>{SIGN_IN_COPY.codeLabel}</Label>
        <Input />
      </TextField>
      {feedback && (
        <Alert status={feedback.isError ? 'danger' : 'success'}>
          <Alert.Content>
            <Alert.Description>{feedback.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button type="submit" isPending={verify.isPending}>
        {verify.isPending ? SIGN_IN_COPY.verifying : SIGN_IN_COPY.verify}
      </Button>
      {feedback?.isExpired && (
        <Button variant="secondary" onPress={handleResend} isPending={resend.isPending}>
          {SIGN_IN_COPY.resend}
        </Button>
      )}
      <Button variant="ghost" onPress={onBack}>
        {SIGN_IN_COPY.useAnotherEmail}
      </Button>
    </form>
  );
};
