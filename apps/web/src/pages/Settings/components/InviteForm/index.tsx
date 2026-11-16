import { Alert, Button, Input, Label, TextField } from '@heroui/react';
import { INVITE_EMAIL_MAX_LENGTH } from '@fridgeboard/contract/households/constants';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { INVITE_COPY } from './constants';
import { useInviteForm } from './hooks/useInviteForm';

export const InviteForm = () => {
  const { email, setEmail, feedback, isSending, handleSubmit } = useInviteForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Typography variant={TypographyVariant.Heading3} as="h3">
        {INVITE_COPY.title}
      </Typography>
      <TextField
        name="email"
        type="email"
        isRequired
        maxLength={INVITE_EMAIL_MAX_LENGTH}
        value={email}
        onChange={setEmail}
      >
        <Label>{INVITE_COPY.label}</Label>
        <Input />
      </TextField>
      {feedback && (
        <Alert status={feedback.kind === 'success' ? 'success' : 'danger'}>
          <Alert.Content>
            <Alert.Description>{feedback.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button type="submit" isPending={isSending}>
        {isSending ? INVITE_COPY.sending : INVITE_COPY.submit}
      </Button>
    </form>
  );
};
