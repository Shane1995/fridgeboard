import type { IOnboardingSection } from '@fridgeboard/contract/onboarding';
import { OnboardingSectionId, SKIPPABLE_SECTIONS } from './constants.ts';
import type { OnboardingInput } from './types.ts';

const toSection = (id: OnboardingSectionId): IOnboardingSection => ({
  id,
  skippable: SKIPPABLE_SECTIONS.has(id),
});

// The sections the user still has to complete, in order. Add a rule here to require a new setup step.
export const buildOnboarding = ({
  username,
  canCreateHousehold,
  isAdmin,
  hasHousehold,
  skippedSections,
}: OnboardingInput): IOnboardingSection[] => {
  const mayCreate = canCreateHousehold || isAdmin;
  const pending = [
    ...(username === null ? [OnboardingSectionId.Username] : []),
    ...(mayCreate && !hasHousehold ? [OnboardingSectionId.Household] : []),
    ...(!mayCreate && !hasHousehold ? [OnboardingSectionId.NeedsInvite] : []),
  ];
  return pending
    .map(toSection)
    .filter(({ id, skippable }) => !(skippable && skippedSections.includes(id)));
};
