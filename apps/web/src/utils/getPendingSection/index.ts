import type { IMeResponse, OnboardingSectionId } from '@fridgeboard/contract/me';
import { KNOWN_SECTIONS } from './constants';

export const getPendingSection = ({ onboarding }: IMeResponse): OnboardingSectionId | undefined =>
  onboarding.find(({ id, done }) => !done && KNOWN_SECTIONS.includes(id))?.id;
