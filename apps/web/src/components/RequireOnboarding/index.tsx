import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useMeQuery } from '../../hooks/useMeQuery';
import { getPendingSection } from '../../utils/getPendingSection';
import { AppLoader } from '../AppLoader';
import { ONBOARDING_PATH } from './constants';

export const RequireOnboarding = ({ children }: PropsWithChildren) => {
  const { data, isPending } = useMeQuery();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onOnboardingPage = pathname === ONBOARDING_PATH;
  const needsOnboarding = data !== undefined && getPendingSection(data) !== undefined;

  useEffect(() => {
    if (needsOnboarding && !onOnboardingPage) {
      void navigate({ to: ONBOARDING_PATH, replace: true });
    } else if (data !== undefined && !needsOnboarding && onOnboardingPage) {
      void navigate({ to: '/', replace: true });
    }
  }, [needsOnboarding, onOnboardingPage, data, navigate]);

  if (isPending || (needsOnboarding && !onOnboardingPage)) {
    return <AppLoader />;
  }
  return children;
};
