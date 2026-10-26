import { useContext } from 'react';
import { RealtimeContext } from '../../Context/Realtime/context';
import type { RealtimeApi } from '../../Context/Realtime/types';

export const useRealtime = (): RealtimeApi => useContext(RealtimeContext);
