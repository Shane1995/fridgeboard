import type { ChangeType } from '@fridgeboard/contract/changes';
import { useEffect, useMemo, useState } from 'react';
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
import type { InvalidateOnOptions, RealtimeApi, Registration } from './types';

// Holds the one connection to the household's channel and tells whoever is listening what changed.
// However many components ask for the same list to refresh on the same kinds of change, there is
// one listener for it, and a burst of changes becomes one refresh.
// A feature does not open its own connection: it calls `useInvalidateOnChange` for the kinds of
// change it cares about.
export const RealtimeProvider = ({ children }: PropsWithChildren) => {
  const enabled = useFeatureFlag(WebFeatureFlag.ENABLE_LIVE_SYNC);
  const { services } = useRemoteConfigContext();
  const { status, getToken } = useSessionContext();
  const { householdId } = useListParams();
  const [bus] = useState(() => createEventBus<ChangeType, ChangeEvent>());
  const [seen] = useState<{ since: number | undefined }>(() => ({ since: undefined }));
  const { refetch } = useChangesQuery({ householdId, getSince: () => seen.since });
  const invalidateQueries = useInvalidateQueries();
  const [latest] = useState({ getToken, refetch, invalidateQueries });
  useEffect(() => {
    Object.assign(latest, { getToken, refetch, invalidateQueries });
  });
  const [coalescer] = useState(() =>
    createCoalescer({
      delayMs: INVALIDATE_DELAY_MS,
      flush: (keys) => {
        void latest.invalidateQueries({ keys });
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
      getToken: () => latest.getToken(),
      openChannel,
      fetchChanges: async ({ since }) => {
        seen.since = since;
        const { data, error } = await latest.refetch();
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
  }, [enabled, realtimeHost, httpHost, householdId, status, bus, seen, latest]);

  const [registrations] = useState(() => new Map<string, Registration>());
  const invalidateOn = useMemo(
    () =>
      ({ types, keys }: InvalidateOnOptions): (() => void) => {
        const id = `${types.join(',')}|${keys.join(',')}`;
        const existing = registrations.get(id);
        if (existing === undefined) {
          registrations.set(id, {
            count: 1,
            unsubscribes: types.map((topic) =>
              bus.subscribe({ topic, listener: () => coalescer.add(keys) }),
            ),
          });
        } else {
          existing.count += 1;
        }
        return () => {
          const entry = registrations.get(id);
          if (entry === undefined) {
            return;
          }
          entry.count -= 1;
          if (entry.count === 0) {
            entry.unsubscribes.forEach((unsubscribe) => unsubscribe());
            registrations.delete(id);
          }
        };
      },
    [bus, coalescer, registrations],
  );
  const api = useMemo<RealtimeApi>(
    () => ({ subscribe: bus.subscribe, invalidateOn }),
    [bus, invalidateOn],
  );

  return <RealtimeContext.Provider value={api}>{children}</RealtimeContext.Provider>;
};
