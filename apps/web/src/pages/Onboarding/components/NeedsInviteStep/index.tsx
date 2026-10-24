import { Button } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';
import { useSignOutMutation } from '../../../../hooks/useSignOutMutation';
import { ONBOARDING_COPY } from '../../constants';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';

const COPY = ONBOARDING_COPY.needsInvite;

export const NeedsInviteStep = () => {
  const navigate = useNavigate();
  const signOut = useSignOutMutation();

  return (
    <div className="flex flex-col gap-4">
      <Typography variant={TypographyVariant.Heading2}>{COPY.title}</Typography>
      <Typography>{COPY.intro}</Typography>
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
