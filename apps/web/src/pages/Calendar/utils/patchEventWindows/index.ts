import type { IEventsResponse } from '@fridgeboard/contract/events';
import { QueryName } from '../../../../services/configuration/schema/constants';
import type { EventWindow, PatchEventWindowsOptions } from './types';

const readWindow = (key: readonly unknown[]): EventWindow => key[1] as EventWindow;

// Writes one saved event into every cached month it overlaps and out of the ones it no longer
// does, so a save never needs a second request. Pass no `event` to remove it everywhere.
export const patchEventWindows = ({ queryClient, id, event }: PatchEventWindowsOptions): void => {
  for (const [key, cached] of queryClient.getQueriesData<IEventsResponse>({
    queryKey: [QueryName.events],
  })) {
    if (cached === undefined) {
      continue;
    }
    const { from, to } = readWindow(key);
    const rest = cached.events.filter((existing) => existing.id !== id);
    const overlaps = event !== undefined && event.startDate <= to && event.endDate >= from;
    queryClient.setQueryData<IEventsResponse>(key, {
      ...cached,
      events: overlaps ? [...rest, event] : rest,
    });
  }
};
