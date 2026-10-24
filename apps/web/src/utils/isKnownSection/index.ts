import { OnboardingSectionId } from '../../services/onboarding/constants';

// A section the server adds that this build does not know is skipped, so an older cached app
// is never stuck on a screen it cannot show.
export const isKnownSection = (id: string): id is OnboardingSectionId =>
  Object.values<string>(OnboardingSectionId).includes(id);
