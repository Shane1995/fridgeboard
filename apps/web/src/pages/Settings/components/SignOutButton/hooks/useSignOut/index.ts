import { useNavigate } from '@tanstack/react-router';
import { useSignOutMutation } from '../../../../../../hooks/useSignOutMutation';

// Signs out and always lands on the sign-in page, even when the request to the server fails.
export const useSignOut = () => {
  const navigate = useNavigate();
  const signOutMutation = useSignOutMutation();

  const signOut = () =>
    signOutMutation.mutate(undefined, {
      onSettled: () => navigate({ to: '/sign-in', search: { redirect: '/' } }),
    });

  return { signOut, isSigningOut: signOutMutation.isPending };
};
