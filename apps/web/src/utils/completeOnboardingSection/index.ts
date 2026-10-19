import type { IMeResponse, OnboardingSectionId } from '@fridgeboard/contract/me';

export const completeOnboardingSection = (
  me: IMeResponse,
  id: OnboardingSectionId,
): IMeResponse => ({
  ...me,
  onboarding: me.onboarding.map((section) =>
    section.id === id ? { ...section, done: true } : section,
  ),
});
