import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import type { OnboardingSectionId } from '../../services/onboarding/constants';
import { isKnownSection } from '../isKnownSection';

export const getPendingSection = ({
  sections,
}: IOnboardingResponse): OnboardingSectionId | undefined =>
  sections.flatMap(({ id, done }) => (!done && isKnownSection(id) ? [id] : []))[0];
