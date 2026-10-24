import { Button } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { BuildInfo } from '../../components/BuildInfo';
import { useMeQuery } from '../../hooks/useMeQuery';
import { useSignOutMutation } from '../../hooks/useSignOutMutation';
import { HOME_COPY } from './constants';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';

export const Home = () => {
  const navigate = useNavigate();
  const { data } = useMeQuery();
  const signOut = useSignOutMutation();

  const handleSignOut = () =>
    signOut.mutate(undefined, {
      onSettled: () => navigate({ to: '/sign-in', search: { redirect: '/' } }),
    });

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <Typography variant={TypographyVariant.Logo}>{HOME_COPY.title}</Typography>
      <Typography variant={TypographyVariant.Lead}>{HOME_COPY.tagline}</Typography>
      {data && (
        <Typography>
          {HOME_COPY.signedInAs} {data.username ?? data.email}
        </Typography>
      )}
      <Button isDisabled>
        <Plus aria-hidden size={18} />
        {HOME_COPY.addItem}
      </Button>
      <Button variant="secondary" onPress={handleSignOut} isPending={signOut.isPending}>
        {HOME_COPY.signOut}
      </Button>
      <BuildInfo />
    </main>
  );
};
