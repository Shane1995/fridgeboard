const UNSAFE_URL_PATTERN = /\.\.|[%?#\\\s]|\/\//;
export const API_URL_PATTERN = /^\/api\//;
export const SAFE_URL_PATTERN = new RegExp(`^(?!.*(?:${UNSAFE_URL_PATTERN.source})).*$`);
export const ENDPOINT_PATH_PATTERN = /^\/(?!\/)[A-Za-z0-9/_{}-]*$/;

export const WEB_CONFIGURATION_VERSION = 2;

export enum WebFeatureFlag {
  ENABLE_ADMIN_INVITES = 'ENABLE_ADMIN_INVITES',
  ENABLE_PASSKEYS = 'ENABLE_PASSKEYS',
}

export const WEB_FEATURE_FLAGS: readonly string[] = Object.values(WebFeatureFlag);

export enum WebService {
  householdInvites = 'householdInvites',
  householdMembers = 'householdMembers',
  listShop = 'listShop',
  listShops = 'listShops',
  listShopsOrder = 'listShopsOrder',
  listHistory = 'listHistory',
  listItem = 'listItem',
  listItems = 'listItems',
  me = 'me',
  onboarding = 'onboarding',
  onboardingSkip = 'onboardingSkip',
  households = 'households',
  passkeyStart = 'passkeyStart',
  passkeyVerify = 'passkeyVerify',
  passkeysComplete = 'passkeysComplete',
  passkeysStart = 'passkeysStart',
  refresh = 'refresh',
  requestCode = 'requestCode',
  signOut = 'signOut',
  username = 'username',
  verify = 'verify',
}

export const WEB_SERVICES = Object.values(WebService);

export enum QueryName {
  me = 'me',
  onboarding = 'onboarding',
  households = 'households',
  shops = 'shops',
  items = 'items',
  members = 'members',
  suggestions = 'suggestions',
}

export enum MutationName {
  startSignIn = 'startSignIn',
  verifyCode = 'verifyCode',
  signOut = 'signOut',
  setUsername = 'setUsername',
  createHousehold = 'createHousehold',
  addItem = 'addItem',
  updateItem = 'updateItem',
  deleteItem = 'deleteItem',
  clearChecked = 'clearChecked',
  createShop = 'createShop',
  updateShop = 'updateShop',
  deleteShop = 'deleteShop',
  reorderShops = 'reorderShops',
  signInWithPasskey = 'signInWithPasskey',
  registerPasskey = 'registerPasskey',
}

export const REQUEST_TIMEOUT_BOUNDS = { min: 1_000, max: 30_000 } as const;

export const QUERY_BOUNDS = {
  timeMs: { min: 0, max: 3_600_000 },
  retry: { min: 0, max: 5 },
  meStaleTimeMs: { max: 300_000 },
} as const;

export const MUTATION_BOUNDS = {
  retry: { min: 0, max: 2 },
} as const;

export const SETTING_BOUNDS = {
  refreshLeadMs: { min: 5_000, max: 300_000 },
  refreshMinIntervalMs: { min: 10_000, max: 600_000 },
  usernameMinLength: { min: 2, max: 8 },
  usernameMaxLength: { min: 8, max: 32 },
} as const;
