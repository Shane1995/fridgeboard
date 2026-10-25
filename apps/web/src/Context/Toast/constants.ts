import type { ToastApi } from './types';

export const TOAST_TIMEOUT_MS = { success: 4000, error: 8000, confirm: 12000 } as const;

export const SILENT_TOASTS: ToastApi = {
  success: () => undefined,
  error: () => undefined,
  confirm: () => undefined,
};
