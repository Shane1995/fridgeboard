import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { WebFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';

export const TEST_WEB_CONFIGURATION: WebConfiguration = {
  featureFlags: {
    [WebFeatureFlag.ENABLE_ADMIN_INVITES]: false,
    [WebFeatureFlag.ENABLE_PASSKEYS]: false,
  },
  mutations: { default: { retry: 0, timeoutMs: 10_000 } },
  queries: {
    default: {
      gcTimeMs: 300_000,
      refetchOnWindowFocus: true,
      retry: 1,
      staleTimeMs: 30_000,
      timeoutMs: 10_000,
    },
  },
  services: {
    api: {
      basePath: '/api/{version}',
      endpoints: {
        [WebService.households]: '/households',
        [WebService.me]: '/me',
        [WebService.passkeyStart]: '/auth/passkey/start',
        [WebService.passkeyVerify]: '/auth/passkey/verify',
        [WebService.passkeysComplete]: '/auth/passkeys/complete',
        [WebService.passkeysStart]: '/auth/passkeys/start',
        [WebService.refresh]: '/auth/refresh',
        [WebService.requestCode]: '/auth/start',
        [WebService.signOut]: '/auth/sign-out',
        [WebService.username]: '/me/username',
        [WebService.verify]: '/auth/verify',
      },
      params: { version: 'v1' },
    },
  },
  settings: {
    refreshLeadMs: 60_000,
    refreshMinIntervalMs: 60_000,
    usernameMaxLength: 20,
    usernameMinLength: 3,
  },
  version: 2,
};
