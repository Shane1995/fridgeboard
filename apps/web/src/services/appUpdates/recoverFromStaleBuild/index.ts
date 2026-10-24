import { STALE_BUILD_CHECK_KEY } from './constants';

// When the app fails to load, the usual cause is a tab still running an old build. Ask the service
// worker whether a newer one exists; `registerAppUpdates` reloads into it as soon as it is ready.
// This runs once per session and never reloads the page itself, so it cannot loop.
export const recoverFromStaleBuild = async (): Promise<void> => {
  try {
    if (sessionStorage.getItem(STALE_BUILD_CHECK_KEY) !== null) {
      return;
    }
    sessionStorage.setItem(STALE_BUILD_CHECK_KEY, 'true');
    const registration = await navigator.serviceWorker?.getRegistration();
    await registration?.update();
  } catch {
    return;
  }
};
