import { registerSW } from 'virtual:pwa-register';
import { UPDATE_CHECK_INTERVAL_MS, VISIBILITY_EVENT, VISIBLE } from './constants';

// iOS does not re-check the service worker when a home-screen app resumes, so check ourselves.
export const registerAppUpdates = (): void => {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => {
      void updateSW(true);
    },
    onRegisteredSW: (_url, registration) => {
      if (!registration) {
        return;
      }
      const check = () => void registration.update();
      setInterval(check, UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener(VISIBILITY_EVENT, () => {
        if (document.visibilityState === VISIBLE) {
          check();
        }
      });
    },
  });
};
