import type { ToastApi } from './types';

export const TOAST_TIMEOUT_MS = { success: 3000, undo: 6000, error: 6000, confirm: 12000 } as const;

export const SILENT_TOASTS: ToastApi = {
  success: () => undefined,
  error: () => undefined,
  confirm: () => undefined,
};
