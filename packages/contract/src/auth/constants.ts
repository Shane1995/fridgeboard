export const API_PATHS = {
  start: '/api/v1/auth/start',
  verify: '/api/v1/auth/verify',
  refresh: '/api/v1/auth/refresh',
  signOut: '/api/v1/auth/sign-out',
  passkeyStart: '/api/v1/auth/passkey/start',
  passkeyVerify: '/api/v1/auth/passkey/verify',
  passkeysStart: '/api/v1/auth/passkeys/start',
  passkeysComplete: '/api/v1/auth/passkeys/complete',
  me: '/api/v1/me',
} as const;
