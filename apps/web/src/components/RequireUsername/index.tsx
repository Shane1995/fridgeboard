import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useMeQuery } from '../../hooks/useMeQuery';
import { AppLoader } from '../AppLoader';
import { USERNAME_PATH } from './constants';

export const RequireUsername = ({ children }: PropsWithChildren) => {
  const { data, isPending } = useMeQuery();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onUsernamePage = pathname === USERNAME_PATH;
  const needsUsername = data !== undefined && data.username === null;

  useEffect(() => {
    if (needsUsername && !onUsernamePage) {
      void navigate({ to: USERNAME_PATH, replace: true });
    } else if (data?.username != null && onUsernamePage) {
      void navigate({ to: '/', replace: true });
    }
  }, [needsUsername, onUsernamePage, data?.username, navigate]);

  if (isPending || (needsUsername && !onUsernamePage)) {
    return <AppLoader />;
  }
  return children;
};
