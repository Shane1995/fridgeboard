export const writeLocalStorage = (key: string, value: string | undefined): void => {
  try {
    if (value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Storage can be blocked (private mode); callers keep working without it.
  }
};
