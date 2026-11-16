import { Button } from '@heroui/react';
import { LogOut } from 'lucide-react';
import { SIGN_OUT_COPY } from './constants';
import { useSignOut } from './hooks/useSignOut';

export const SignOutButton = () => {
  const { signOut, isSigningOut } = useSignOut();
  return (
    <Button variant="danger-soft" isPending={isSigningOut} onPress={signOut}>
      <LogOut aria-hidden size={18} />
      {SIGN_OUT_COPY.button}
    </Button>
  );
};
