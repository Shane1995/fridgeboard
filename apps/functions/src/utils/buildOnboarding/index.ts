import type { IOnboardingSection } from '@fridgeboard/contract/onboarding';
import { OnboardingSectionId } from './constants.ts';
import type { OnboardingInput } from './types.ts';

// The sections the user still has to complete, in order. Add a rule here to require a new setup step.
export const buildOnboarding = ({
  username,
  canCreateHousehold,
  isAdmin,
  hasHousehold,
}: OnboardingInput): IOnboardingSection[] => {
  const mayCreate = canCreateHousehold || isAdmin;
  return [
    ...(username === null ? [{ id: OnboardingSectionId.Username }] : []),
    ...(mayCreate && !hasHousehold ? [{ id: OnboardingSectionId.Household }] : []),
    ...(!mayCreate && !hasHousehold ? [{ id: OnboardingSectionId.NeedsInvite }] : []),
  ];
};
