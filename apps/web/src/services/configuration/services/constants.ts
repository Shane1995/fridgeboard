export enum WebService {
  me = 'me',
  onboarding = 'onboarding',
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

export const ENDPOINT_PATH_PATTERN = /^\/(?!\/)[A-Za-z0-9/_-]*$/;
