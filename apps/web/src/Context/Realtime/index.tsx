import type { ChangeType } from '@fridgeboard/contract/changes';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useChangesQuery } from '../../hooks/useChangesQuery';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { useInvalidateQueries } from '../../hooks/useInvalidateQueries';
import { useListParams } from '../../hooks/useListParams';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import { useSessionContext } from '../../hooks/useSessionContext';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { createCoalescer } from '../../services/coalescer/createCoalescer';
import { createEventBus } from '../../services/eventBus/createEventBus';
import { createLiveSync } from '../../services/realtime/createLiveSync';
import { openChannel } from '../../services/realtime/openChannel';
import type { ChangeEvent } from '../../services/realtime/types';
import { SessionStatus, VISIBILITY_EVENT, VISIBLE } from '../../services/session/constants';
import { CHANGES_FAILED, INVALIDATE_DELAY_MS, ONLINE_EVENT } from './constants';
import { RealtimeContext } from './context';
import type { RealtimeApi } from './types';

// Holds the one connection to the household's channel and tells whoever is listening what changed.
// Several screens can ask for the same list to be refreshed at once; those asks are merged into one.
// A feature does not open its own connection: it calls `useOnChange` for the kinds of change it
// cares about.
export const RealtimeProvider = ({ children }: PropsWithChildren) => {
  const enabled = useFeatureFlag(WebFeatureFlag.ENABLE_LIVE_SYNC);
  const { services } = useRemoteConfigContext();
  const { status, getToken } = useSessionContext();
  const { householdId } = useListParams();
  const [bus] = useState(() => createEventBus<ChangeType, ChangeEvent>());
  const sinceRef = useRef<number | undefined>(undefined);
  const { refetch } = useChangesQuery({ householdId, getSince: () => sinceRef.current });
  const invalidateQueries = useInvalidateQueries();
  const latest = useRef({ getToken, refetch, invalidateQueries });
  useEffect(() => {
    latest.current = { getToken, refetch, invalidateQueries };
  });
  const [coalescer] = useState(() =>
    createCoalescer({
      delayMs: INVALIDATE_DELAY_MS,
      flush: (keys) => {
        void latest.current.invalidateQueries({ keys });
      },
    }),
  );
  useEffect(() => () => coalescer.cancel(), [coalescer]);
  const realtimeHost = services.realtime?.realtimeHost;
  const httpHost = services.realtime?.httpHost;

  useEffect(() => {
    if (
      !enabled ||
      realtimeHost === undefined ||
      httpHost === undefined ||
      householdId === undefined ||
      status !== SessionStatus.SignedIn
    ) {
      return undefined;
    }
    const liveSync = createLiveSync({
      realtimeHost,
      httpHost,
      householdId,
      getToken: () => latest.current.getToken(),
      openChannel,
      fetchChanges: async ({ since }) => {
        sinceRef.current = since;
        const { data, error } = await latest.current.refetch();
        if (data === undefined) {
          throw error ?? new Error(CHANGES_FAILED);
        }
        return data;
      },
      onChanges: (events) => {
        events.forEach((event) => bus.emit({ topic: event.type, event }));
      },
    });
    const resume = (): void => {
      if (document.visibilityState === VISIBLE) {
        liveSync.resume();
      }
    };
    liveSync.start();
    document.addEventListener(VISIBILITY_EVENT, resume);
    window.addEventListener(ONLINE_EVENT, resume);
    return () => {
      liveSync.stop();
      document.removeEventListener(VISIBILITY_EVENT, resume);
      window.removeEventListener(ONLINE_EVENT, resume);
    };
  }, [enabled, realtimeHost, httpHost, householdId, status, bus]);

  const api = useMemo<RealtimeApi>(
    () => ({ subscribe: bus.subscribe, invalidate: ({ keys }) => coalescer.add(keys) }),
    [bus, coalescer],
  );

  return <RealtimeContext.Provider value={api}>{children}</RealtimeContext.Provider>;
};
