import type { IEvent } from '@fridgeboard/contract/events';
import type { QueryClient } from '@tanstack/react-query';

export type EventWindow = { householdId: string; from: string; to: string };

export type PatchEventWindowsOptions = {
  queryClient: QueryClient;
  id: string;
  event?: IEvent;
};
