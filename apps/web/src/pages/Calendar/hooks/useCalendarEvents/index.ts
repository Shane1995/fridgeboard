import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { useApiCalendarEvents } from '../useApiCalendarEvents';
import { useLocalCalendarEvents } from '../useLocalCalendarEvents';
import type { CalendarEventsState } from '../useLocalCalendarEvents/types';
import type { UseCalendarEventsOptions } from './types';

// The calendar's events: the saved ones from the server while ENABLE_CALENDAR_API is on, the local
// dummy ones otherwise. Both hooks always run so the order of hooks never changes; the API one only
// sends a request while its flag is on.
export const useCalendarEvents = ({ from, to }: UseCalendarEventsOptions): CalendarEventsState => {
  const useApi = useFeatureFlag(WebFeatureFlag.ENABLE_CALENDAR_API);
  const api = useApiCalendarEvents({ from, to, enabled: useApi });
  const local = useLocalCalendarEvents();
  return useApi ? api : local;
};
