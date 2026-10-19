import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { useSessionContext } from '../../hooks/useSessionContext';
import { SessionStatus } from '../../services/session/constants';
import { AppLoader } from '../AppLoader';

export const RequireSession = ({ children }: PropsWithChildren) => {
  const { status } = useSessionContext();
  const navigate = useNavigate();
  const { href } = useLocation();
  const lastHref = useRef(href);

  useEffect(() => {
    if (status !== SessionStatus.SignedOut) {
      lastHref.current = href;
    }
  }, [status, href]);

  useEffect(() => {
    if (status === SessionStatus.SignedOut) {
      void navigate({ to: '/sign-in', search: { redirect: lastHref.current }, replace: true });
    }
  }, [status, navigate]);

  if (status === SessionStatus.SignedIn) {
    return children;
  }
  return status === SessionStatus.Loading ? <AppLoader /> : null;
};
