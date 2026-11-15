import type { Profile } from '../../repository/profile/types.ts';

export type PendingOnboardingInput = { sub: string; profile: Profile; isAdmin: boolean };
