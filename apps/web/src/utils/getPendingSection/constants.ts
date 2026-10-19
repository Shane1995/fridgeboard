import type { OnboardingSectionId } from '@fridgeboard/contract/me';

// Sections this build can render. A section the server adds that is not listed is skipped,
// so an older cached app is never stuck on a screen it cannot show.
export const KNOWN_SECTIONS: readonly OnboardingSectionId[] = [
  'username',
  'household',
  'needs-invite',
];
