import type { IOnboardingSection, OnboardingSectionId } from '@fridgeboard/contract/me';
import { KNOWN_SECTIONS } from '../../../../utils/getPendingSection/constants';
import { ONBOARDING_COPY } from '../../constants';
import { NON_STEP_SECTIONS } from './constants';

export const getProgress = (
  sections: IOnboardingSection[],
  current: OnboardingSectionId,
): string | undefined => {
  const steps = sections.filter(
    ({ id }) => KNOWN_SECTIONS.includes(id) && !NON_STEP_SECTIONS.includes(id),
  );
  const index = steps.findIndex(({ id }) => id === current);
  return steps.length > 1 && index >= 0
    ? ONBOARDING_COPY.progress(index + 1, steps.length)
    : undefined;
};
