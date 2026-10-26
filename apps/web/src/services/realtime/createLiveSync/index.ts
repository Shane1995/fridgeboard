import type { IChange } from '@fridgeboard/contract/changes';
import { CHANGE_TYPES } from '@fridgeboard/contract/changes/constants';
import { CATCH_UP_ROUNDS, CHANNEL_PREFIX } from '../constants';
import { nextBackoff } from '../nextBackoff';
import type { CreateLiveSyncOptions, LiveSync, LiveSyncState } from '../types';

export const createLiveSync = ({
  realtimeHost,
  httpHost,
  householdId,
  getToken,
  openChannel,
  fetchChanges,
  onChanges,
}: CreateLiveSyncOptions): LiveSync => {
  const state: LiveSyncState = {
    rev: undefined,
    seen: 0,
    stopped: true,
    connecting: false,
    attempt: 0,
    socket: undefined,
    timer: undefined,
    catchingUp: undefined,
  };

  const catchUpRound = async ({ round }: { round: number }): Promise<void> => {
    const response = await fetchChanges({ since: state.rev });
    state.rev = response.rev;
    onChanges(
      'snapshot' in response
        ? CHANGE_TYPES.map((type) => ({ type, id: undefined }))
        : response.changes.map(({ type, id }) => ({ type, id })),
    );
    if (state.seen > state.rev && round < CATCH_UP_ROUNDS) {
      await catchUpRound({ round: round + 1 });
    }
  };

  const catchUp = (): Promise<void> => {
    state.catchingUp ??= catchUpRound({ round: 1 })
      .catch(() => undefined)
      .finally(() => {
        state.catchingUp = undefined;
      });
    return state.catchingUp;
  };

  const handleChange = (change: IChange): void => {
    state.seen = Math.max(state.seen, change.rev);
    if (state.rev === undefined || change.rev > state.rev + 1) {
      void catchUp();
      return;
    }
    if (change.rev === state.rev + 1) {
      state.rev = change.rev;
      onChanges([{ type: change.type, id: change.id }]);
    }
  };

  const scheduleRetry = (): void => {
    if (state.stopped) {
      return;
    }
    clearTimeout(state.timer);
    state.timer = setTimeout(() => void connect(), nextBackoff({ attempt: state.attempt }));
    state.attempt += 1;
  };

  const connect = async (): Promise<void> => {
    if (state.stopped || state.connecting || state.socket !== undefined) {
      return;
    }
    state.connecting = true;
    const token = await getToken().catch(() => undefined);
    state.connecting = false;
    if (state.stopped) {
      return;
    }
    if (token === undefined) {
      scheduleRetry();
      return;
    }
    state.socket = openChannel({
      realtimeHost,
      httpHost,
      token,
      channel: `${CHANNEL_PREFIX}${householdId}`,
      onSubscribed: () => {
        state.attempt = 0;
        void catchUp();
      },
      onChange: handleChange,
      onClosed: () => {
        state.socket = undefined;
        scheduleRetry();
      },
    });
  };

  return {
    start: () => {
      state.stopped = false;
      void connect();
    },
    stop: () => {
      state.stopped = true;
      clearTimeout(state.timer);
      state.socket?.close();
      state.socket = undefined;
    },
    resume: () => {
      if (state.stopped) {
        return;
      }
      void catchUp();
      if (state.socket === undefined) {
        clearTimeout(state.timer);
        void connect();
      }
    },
  };
};
