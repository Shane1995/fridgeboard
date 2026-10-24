import type { WebConfiguration } from '../../hooks/useRemoteConfigContext/types';
import { createContext } from 'react';

export const RemoteConfigContext = createContext<WebConfiguration | null>(null);
