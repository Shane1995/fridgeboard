import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useMeQuery } from '../../hooks/useMeQuery';
import { useOnboardingQuery } from '../../hooks/useOnboardingQuery';
import { getPendingSection } from '../../utils/getPendingSection';
import { AppLoader } from '../AppLoader';
import { ONBOARDING_PATH } from './constants';

export const RequireOnboarding = ({ children }: PropsWithChildren) => {
  const me = useMeQuery();
  const hasOnboarding = me.data?.hasOnboarding === true;
  const onboarding = useOnboardingQuery(hasOnboarding);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onOnboardingPage = pathname === ONBOARDING_PATH;
  const needsOnboarding =
    onboarding.data !== undefined && getPendingSection(onboarding.data) !== undefined;
  const settled = me.data !== undefined && (!hasOnboarding || onboarding.data !== undefined);

  useEffect(() => {
    if (hasOnboarding && needsOnboarding && !onOnboardingPage) {
      void navigate({ to: ONBOARDING_PATH, replace: true });
    } else if (settled && !(hasOnboarding && needsOnboarding) && onOnboardingPage) {
      void navigate({ to: '/', replace: true });
    }
  }, [hasOnboarding, needsOnboarding, onOnboardingPage, settled, navigate]);

  if (me.isPending || (hasOnboarding && onboarding.isPending)) {
    return <AppLoader />;
  }
  if (hasOnboarding && needsOnboarding && !onOnboardingPage) {
    return <AppLoader />;
  }
  return children;
};
