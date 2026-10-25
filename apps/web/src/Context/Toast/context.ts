import { createContext } from 'react';
import { SILENT_TOASTS } from './constants';
import type { ToastApi } from './types';

export const ToastContext = createContext<ToastApi>(SILENT_TOASTS);
