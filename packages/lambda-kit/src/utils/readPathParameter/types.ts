import type { AuthenticatedUser } from '../withAuthenticatedUser/types.ts';

export type ReadPathParameterOptions = { user: AuthenticatedUser; name: string };
