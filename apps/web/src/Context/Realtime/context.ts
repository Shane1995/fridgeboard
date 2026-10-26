import { createContext } from 'react';
import { SILENT_REALTIME } from './constants';
import type { RealtimeApi } from './types';

export const RealtimeContext = createContext<RealtimeApi>(SILENT_REALTIME);
