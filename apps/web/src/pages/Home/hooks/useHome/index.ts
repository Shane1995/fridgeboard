import { useNavigate } from '@tanstack/react-router';
import { useMeQuery } from '../../../../hooks/useMeQuery';
import { useSignOutMutation } from '../../../../hooks/useSignOutMutation';
import type { HomeState } from './types';

export const useHome = (): HomeState => {
  const navigate = useNavigate();
  const { data } = useMeQuery();
  const signOut = useSignOutMutation();

  const handleSignOut = () =>
    signOut.mutate(undefined, {
      onSettled: () => navigate({ to: '/sign-in', search: { redirect: '/' } }),
    });

  return { me: data, isSigningOut: signOut.isPending, handleSignOut };
};
