export const forceAppRefresh = async (): Promise<void> => {
  try {
    const registrations = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(registrations.map((registration) => registration.unregister()));
    const keys = (await globalThis.caches?.keys()) ?? [];
    await Promise.all(keys.map((key) => globalThis.caches.delete(key)));
  } finally {
    window.location.reload();
  }
};
