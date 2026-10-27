import { WebService } from '../../services/configuration/schema/constants';
import type { WebConfiguration } from '../../hooks/useRemoteConfigContext/types';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';

export const TEST_WEB_CONFIGURATION: WebConfiguration = {
  featureFlags: {
    [WebFeatureFlag.ENABLE_ADMIN_INVITES]: false,
    [WebFeatureFlag.ENABLE_CALENDAR]: false,
    [WebFeatureFlag.ENABLE_HOUSEHOLD_INVITES]: false,
    [WebFeatureFlag.ENABLE_ITEM_DRAG]: false,
    [WebFeatureFlag.ENABLE_LIVE_SYNC]: false,
    [WebFeatureFlag.ENABLE_PASSKEYS]: false,
    [WebFeatureFlag.ENABLE_PULL_TO_REFRESH]: false,
    [WebFeatureFlag.ENABLE_RECIPES]: false,
    [WebFeatureFlag.ENABLE_SHOP_QUICK_ADD]: false,
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
      endpoints: {
        [WebService.householdChanges]: '/api/v1/households/{householdId}/changes',
        [WebService.householdInvites]: '/api/v1/households/{householdId}/invites',
        [WebService.householdMembers]: '/api/v1/households/{householdId}/members',
        [WebService.households]: '/api/v1/households',
        [WebService.listShop]: '/api/v1/households/{householdId}/lists/{listId}/shops/{shopId}',
        [WebService.listShops]: '/api/v1/households/{householdId}/lists/{listId}/shops',
        [WebService.listShopsOrder]: '/api/v1/households/{householdId}/lists/{listId}/shops/order',
        [WebService.listHistory]: '/api/v1/households/{householdId}/lists/{listId}/history',
        [WebService.listItem]: '/api/v1/households/{householdId}/lists/{listId}/items/{itemId}',
        [WebService.listItems]: '/api/v1/households/{householdId}/lists/{listId}/items',
        [WebService.me]: '/api/v1/me',
        [WebService.onboarding]: '/api/v1/me/onboarding',
        [WebService.onboardingSkip]: '/api/v1/me/onboarding/{sectionId}/skip',
        [WebService.passkeyStart]: '/api/v1/auth/passkey/start',
        [WebService.passkeyVerify]: '/api/v1/auth/passkey/verify',
        [WebService.passkeysComplete]: '/api/v1/auth/passkeys/complete',
        [WebService.passkeysStart]: '/api/v1/auth/passkeys/start',
        [WebService.refresh]: '/api/v1/auth/refresh',
        [WebService.requestCode]: '/api/v1/auth/start',
        [WebService.signOut]: '/api/v1/auth/sign-out',
        [WebService.username]: '/api/v1/me/username',
        [WebService.verify]: '/api/v1/auth/verify',
      },
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
