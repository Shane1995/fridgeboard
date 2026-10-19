import { Button } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useMeQuery } from '../../hooks/useMeQuery';
import { useSignOutMutation } from '../../hooks/useSignOutMutation';
import { HOME_COPY } from './constants';

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
      <h1 className="font-hand text-6xl text-accent">{HOME_COPY.title}</h1>
      <p className="text-lg">{HOME_COPY.tagline}</p>
      {data && (
        <p>
          {HOME_COPY.signedInAs} {data.username ?? data.email}
        </p>
      )}
      <Button isDisabled>
        <Plus aria-hidden size={18} />
        {HOME_COPY.addItem}
      </Button>
      <Button variant="secondary" onPress={handleSignOut} isPending={signOut.isPending}>
        {HOME_COPY.signOut}
      </Button>
    </main>
  );
};
