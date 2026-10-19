import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { SessionStatus } from '../../services/session/constants';
import { subscribeSession } from '../../services/session/subscribeSession';

export const useResetCacheOnSignOut = (): void => {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      subscribeSession(({ status }) => {
        if (status === SessionStatus.SignedOut) {
          queryClient.clear();
        }
      }),
    [queryClient],
  );
};
