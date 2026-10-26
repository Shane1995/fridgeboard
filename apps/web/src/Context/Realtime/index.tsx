import { useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useInvalidateQueries } from '../../hooks/useInvalidateQueries';
import { useLatest } from '../../hooks/useLatest';
import { useLiveSyncConnection } from '../../hooks/useLiveSyncConnection';
import { createChangeHub } from '../../services/realtime/createChangeHub';
import { INVALIDATE_DELAY_MS } from './constants';
import { RealtimeContext } from './context';
import type { RealtimeApi } from './types';

// Connects the household's live channel to the screens: what the server reports goes into the
// change hub, and screens listen through `useInvalidateOnChange` (or `subscribe` for a reaction of
// their own).
export const RealtimeProvider = ({ children }: PropsWithChildren) => {
  const latest = useLatest(useInvalidateQueries());
  const [hub] = useState(() =>
    createChangeHub({
      delayMs: INVALIDATE_DELAY_MS,
      invalidate: (keys) => {
        void latest.current({ keys });
      },
    }),
  );
  useEffect(() => () => hub.dispose(), [hub]);
  useLiveSyncConnection({ onChanges: hub.emit });

  const api = useMemo<RealtimeApi>(
    () => ({ subscribe: hub.subscribe, invalidateOn: hub.invalidateOn }),
    [hub],
  );
  return <RealtimeContext.Provider value={api}>{children}</RealtimeContext.Provider>;
};
