import { OnboardingSectionId } from '../../constants.ts';
import type { IOnboardingSection } from '@fridgeboard/contract/onboarding';
import type { OnboardingInput } from './types.ts';

// Ordered sections the app shows until each is done. Add a rule here to require a new setup step.
export const buildOnboarding = ({
  username,
  canCreateHousehold,
  isAdmin,
  hasHousehold,
}: OnboardingInput): IOnboardingSection[] => {
  const mayCreate = canCreateHousehold || isAdmin;
  const householdSections: IOnboardingSection[] = mayCreate
    ? [{ id: OnboardingSectionId.Household, done: hasHousehold }]
    : [];
  const inviteSections: IOnboardingSection[] =
    !mayCreate && !hasHousehold ? [{ id: OnboardingSectionId.NeedsInvite, done: false }] : [];
  return [
    { id: OnboardingSectionId.Username, done: username !== null },
    ...householdSections,
    ...inviteSections,
  ];
};
