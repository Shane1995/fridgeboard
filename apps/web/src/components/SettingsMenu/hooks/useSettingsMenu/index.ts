import { useNavigate } from '@tanstack/react-router';
import { useSignOutMutation } from '../../../../hooks/useSignOutMutation';
import { SettingsMenuAction } from '../../constants';
import type { SettingsMenuState } from './types';

export const useSettingsMenu = (): SettingsMenuState => {
  const navigate = useNavigate();
  const signOut = useSignOutMutation();

  const handleAction = (key: string | number) => {
    if (key === SettingsMenuAction.Profile) {
      void navigate({ to: '/profile' });
    }
    if (key === SettingsMenuAction.SignOut) {
      signOut.mutate(undefined, {
        onSettled: () => navigate({ to: '/sign-in', search: { redirect: '/' } }),
      });
    }
  };

  return { handleAction };
};
