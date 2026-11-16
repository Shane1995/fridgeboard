import { useMemo } from 'react';
import { useEventsQuery } from '../../../../hooks/useEventsQuery';
import type { CalendarEvent } from '../../types';
import { eventDateRange } from '../../utils/eventDateRange';
import { eventToDraft } from '../../utils/eventToDraft';
import { toCalendarEvent } from '../../utils/toCalendarEvent';
import { toEventBody } from '../../utils/toEventBody';
import { toRuleBody } from '../../utils/toRuleBody';
import { toRulePatch } from '../../utils/toRulePatch';
import { useEventMutations } from '../useEventMutations';
import { useEventRuleMutations } from '../useEventRuleMutations';
import type { CalendarEventsState } from '../useLocalCalendarEvents/types';
import type {
  DeleteEventOptions,
  SaveEventOptions,
  UpdateEventOptions,
} from '../useLocalCalendarEvents/types';
import type { UseApiCalendarEventsOptions } from './types';

const NO_EVENTS: CalendarEvent[] = [];

// The calendar's events from the server: one request per window, one per save.
export const useApiCalendarEvents = ({
  from,
  to,
  enabled = true,
}: UseApiCalendarEventsOptions): CalendarEventsState => {
  const { data } = useEventsQuery({ from, to, enabled });
  const events = useMemo(
    () => (data === undefined ? NO_EVENTS : data.map((event) => toCalendarEvent({ event }))),
    [data],
  );
  const { createEvent, updateEvent, deleteEvent } = useEventMutations();
  const rules = useEventRuleMutations();
  const find = (id: string) => events.find((event) => event.id === id);

  return {
    events,
    createEvent: ({ draft }: SaveEventOptions) =>
      draft.repeat === undefined
        ? createEvent.mutate({ body: toEventBody({ draft }) })
        : rules.createRule.mutate({ title: draft.title.trim(), body: toRuleBody({ draft }) }),
    updateEvent: ({ id, draft, scope = 'one' }: UpdateEventOptions) => {
      const current = find(id);
      if (current === undefined) {
        return;
      }
      const body = toEventBody({ draft });
      if (
        JSON.stringify(body) ===
        JSON.stringify(toEventBody({ draft: eventToDraft({ event: current }) }))
      ) {
        return;
      }
      const date = eventDateRange({ event: current }).startDate;
      const title = draft.title.trim();
      if (current.ruleId === undefined) {
        updateEvent.mutate({ id, date, body });
      } else if (scope === 'all') {
        rules.updateRule.mutate({ ruleId: current.ruleId, title, body: toRulePatch({ draft }) });
      } else {
        rules.overrideOccurrence.mutate({ ruleId: current.ruleId, date, title, body });
      }
    },
    deleteEvent: ({ id, scope = 'one' }: DeleteEventOptions) => {
      const current = find(id);
      if (current === undefined) {
        return;
      }
      const date = eventDateRange({ event: current }).startDate;
      const { title } = current;
      if (current.ruleId === undefined) {
        deleteEvent.mutate({ id, date, title });
      } else if (scope === 'all') {
        rules.deleteRule.mutate({ ruleId: current.ruleId, title });
      } else {
        rules.skipOccurrence.mutate({ ruleId: current.ruleId, date, title });
      }
    },
  };
};
