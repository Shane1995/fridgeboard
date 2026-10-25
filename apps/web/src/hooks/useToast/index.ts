import { useContext } from 'react';
import { ToastContext } from '../../Context/Toast/context';
import type { ToastApi } from '../../Context/Toast/types';

export const useToast = (): ToastApi => useContext(ToastContext);
