export enum WebFeatureFlag {
  ENABLE_ADMIN_INVITES = 'ENABLE_ADMIN_INVITES',
  ENABLE_PASSKEYS = 'ENABLE_PASSKEYS',
}

export const WEB_FEATURE_FLAGS: readonly string[] = Object.values(WebFeatureFlag);
