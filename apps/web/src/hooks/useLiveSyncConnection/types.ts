import type { ChangeEvent } from '../../services/realtime/types';

export type UseLiveSyncConnectionOptions = {
  onChanges: (events: readonly ChangeEvent[]) => void;
};
