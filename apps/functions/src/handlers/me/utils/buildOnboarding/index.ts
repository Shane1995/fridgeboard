import type { IOnboardingSection } from '@fridgeboard/contract/me';
import type { OnboardingInput } from './types.ts';

// Ordered sections the app shows until each is done. Add a rule here to require a new setup step.
export const buildOnboarding = ({
  username,
  canCreateHousehold,
  isAdmin,
  hasHousehold,
}: OnboardingInput): IOnboardingSection[] => {
  const mayCreate = canCreateHousehold || isAdmin;
  return [
    { id: 'username', done: username !== null },
    ...(mayCreate ? [{ id: 'household' as const, done: hasHousehold }] : []),
    ...(!mayCreate && !hasHousehold ? [{ id: 'needs-invite' as const, done: false }] : []),
  ];
};
