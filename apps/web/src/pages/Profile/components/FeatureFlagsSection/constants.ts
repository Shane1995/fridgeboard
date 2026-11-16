import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';

export const FEATURE_FLAGS_COPY = {
  title: 'Feature flags',
  hint: 'Switches apply on this device only and reload the app.',
  reset: 'Reset to defaults',
  changed: 'Changed',
} as const;

export const FEATURE_FLAG_LABELS: Record<WebFeatureFlag, string> = {
  [WebFeatureFlag.ENABLE_ADMIN_INVITES]: 'Admin invites',
  [WebFeatureFlag.ENABLE_CALENDAR]: 'Calendar',
  [WebFeatureFlag.ENABLE_CALENDAR_API]: 'Calendar saved to the server',
  [WebFeatureFlag.ENABLE_HOUSEHOLD_INVITES]: 'Household members and invites',
  [WebFeatureFlag.ENABLE_ITEM_DRAG]: 'Drag items between shops',
  [WebFeatureFlag.ENABLE_LIVE_SYNC]: 'Live sync',
  [WebFeatureFlag.ENABLE_PASSKEYS]: 'Passkeys',
  [WebFeatureFlag.ENABLE_PULL_TO_REFRESH]: 'Pull to refresh',
  [WebFeatureFlag.ENABLE_RECIPES]: 'Recipes',
  [WebFeatureFlag.ENABLE_SHOP_QUICK_ADD]: 'Shop quick add',
};
