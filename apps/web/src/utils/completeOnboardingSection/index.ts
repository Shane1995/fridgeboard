import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import type { OnboardingSectionId } from '../../services/onboarding/constants';

export const completeOnboardingSection = (
  onboarding: IOnboardingResponse,
  id: OnboardingSectionId,
): IOnboardingResponse => ({
  sections: onboarding.sections.map((section) =>
    section.id === id ? { ...section, done: true } : section,
  ),
});
