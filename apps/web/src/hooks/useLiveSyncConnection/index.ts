import { useEffect } from 'react';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { createLiveSync } from '../../services/realtime/createLiveSync';
import { openChannel } from '../../services/realtime/openChannel';
import { SessionStatus, VISIBILITY_EVENT, VISIBLE } from '../../services/session/constants';
import { useFeatureFlag } from '../useFeatureFlag';
import { useFetchChanges } from '../useFetchChanges';
import { useLatest } from '../useLatest';
import { useListParams } from '../useListParams';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import { ONLINE_EVENT } from './constants';
import type { UseLiveSyncConnectionOptions } from './types';

// Keeps one connection to the household's channel while live sync is switched on, the realtime
// service is configured, a household is active and the user is signed in. Everything the server
// says arrives through `onChanges`. When the app comes back to the foreground or the network
// returns, it asks what it missed and reconnects if the socket died.
export const useLiveSyncConnection = ({ onChanges }: UseLiveSyncConnectionOptions): void => {
  const enabled = useFeatureFlag(WebFeatureFlag.ENABLE_LIVE_SYNC);
  const { services } = useRemoteConfigContext();
  const { status, getToken } = useSessionContext();
  const { householdId } = useListParams();
  const fetchChanges = useFetchChanges();
  const latest = useLatest({ getToken, fetchChanges, onChanges });
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
      openChannel,
      getToken: () => latest.current.getToken(),
      fetchChanges: (options) => latest.current.fetchChanges(options),
      onChanges: (events) => latest.current.onChanges(events),
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
  }, [enabled, realtimeHost, httpHost, householdId, status, latest]);
};
