import type { IMeResponse } from '@fridgeboard/contract/me';

export type HomeState = {
  me: IMeResponse | undefined;
  isSigningOut: boolean;
  handleSignOut: () => void;
};
