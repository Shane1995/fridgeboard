import { Button } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';
import { useSignOutMutation } from '../../../../hooks/useSignOutMutation';
import { ONBOARDING_COPY } from '../../constants';

const COPY = ONBOARDING_COPY.needsInvite;

export const NeedsInviteStep = () => {
  const navigate = useNavigate();
  const signOut = useSignOutMutation();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{COPY.title}</h2>
      <p>{COPY.intro}</p>
      <Button
        variant="secondary"
        isPending={signOut.isPending}
        onPress={() =>
          signOut.mutate(undefined, {
            onSettled: () => navigate({ to: '/sign-in', search: { redirect: '/' } }),
          })
        }
      >
        {COPY.signOut}
      </Button>
    </div>
  );
};
