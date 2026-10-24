import { Alert, Button, Input, Label, TextField } from '@heroui/react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { CODE_PATTERN, SIGN_IN_COPY } from '../../constants';
import { useCodeStep } from './hooks/useCodeStep';
import type { CodeStepProps } from './types';

export const CodeStep = ({ email, onSignedIn, onBack }: CodeStepProps) => {
  const { code, setCode, feedback, isVerifying, isResending, handleSubmit, handleResend } =
    useCodeStep({ email, onSignedIn });

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
      <Button type="submit" isPending={isVerifying}>
        {isVerifying ? SIGN_IN_COPY.verifying : SIGN_IN_COPY.verify}
      </Button>
      {feedback?.isExpired && (
        <Button variant="secondary" onPress={handleResend} isPending={isResending}>
          {SIGN_IN_COPY.resend}
        </Button>
      )}
      <Button variant="ghost" onPress={onBack}>
        {SIGN_IN_COPY.useAnotherEmail}
      </Button>
    </form>
  );
};
