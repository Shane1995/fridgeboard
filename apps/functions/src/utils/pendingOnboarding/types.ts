import type { Profile } from '../readProfile/types.ts';

export type PendingOnboardingInput = { sub: string; profile: Profile; isAdmin: boolean };
