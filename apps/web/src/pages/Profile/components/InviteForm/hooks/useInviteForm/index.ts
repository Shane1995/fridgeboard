import { useState, type FormEvent } from 'react';
import { useInviteMutation } from '../../../../../../hooks/useInviteMutation';
import { FailureReason } from '../../../../../../services/session/constants';
import { INVITE_COPY } from '../../constants';
import type { InviteFeedback, InviteFormState } from './types';

export const useInviteForm = (): InviteFormState => {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<InviteFeedback | undefined>();
  const invite = useInviteMutation();

  const fail = (reason: keyof typeof INVITE_COPY.reasons) =>
    setFeedback({ kind: 'error', message: INVITE_COPY.reasons[reason] });

  const handleSubmit = (event: Pick<FormEvent, 'preventDefault'>) => {
    event.preventDefault();
    setFeedback(undefined);
    invite.mutate(email.trim(), {
      onSuccess: (result) => {
        if (!result.ok) {
          fail(result.reason);
          return;
        }
        setEmail('');
        const { email: invited, verified } = result.data;
        setFeedback({
          kind: 'success',
          message: verified ? INVITE_COPY.sent(invited) : INVITE_COPY.sentCheckEmail(invited),
        });
      },
      onError: () => fail(FailureReason.Unknown),
    });
  };

  return { email, setEmail, feedback, isSending: invite.isPending, handleSubmit };
};
