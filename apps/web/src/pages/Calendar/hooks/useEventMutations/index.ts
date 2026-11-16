import type { IEvent } from '@fridgeboard/contract/events';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveHousehold } from '../../../../hooks/useActiveHousehold';
import { useApiMutation } from '../../../../hooks/useApiMutation';
import type { MutationResult } from '../../../../hooks/useMutation/types';
import type { ApiResult } from '../../../../services/api/sendJson/types';
import { MutationName, WebService } from '../../../../services/configuration/schema/constants';
import { DELETE, PATCH, POST } from '../../../../services/session/constants';
import { CALENDAR_COPY } from '../../constants';
import { patchEventWindows } from '../../utils/patchEventWindows';
import type { CreateEventVariables, DeleteEventVariables, UpdateEventVariables } from './types';

type EventMutations = {
  createEvent: MutationResult<ApiResult<IEvent, never>, CreateEventVariables>;
  updateEvent: MutationResult<ApiResult<IEvent, never>, UpdateEventVariables>;
  deleteEvent: MutationResult<ApiResult<undefined, never>, DeleteEventVariables>;
};

// Saves go straight into the cached months from the server's answer, so a save is one request.
export const useEventMutations = (): EventMutations => {
  const queryClient = useQueryClient();
  const householdId = useActiveHousehold()?.id ?? '';

  const createEvent = useApiMutation({
    name: MutationName.createEvent,
    service: WebService.events,
    method: POST,
    toBody: ({ body }: CreateEventVariables) => body,
    toParams: () => ({ householdId }),
    reasons: [],
    failureMessage: ({ body }: CreateEventVariables) => CALENDAR_COPY.eventAddFailed(body.title),
    successMessage: (_variables: CreateEventVariables, created: IEvent) =>
      CALENDAR_COPY.eventAdded(created.title),
    onSuccess: (created) => patchEventWindows({ queryClient, id: created.id, event: created }),
  });

  const updateEvent = useApiMutation({
    name: MutationName.updateEvent,
    service: WebService.event,
    method: PATCH,
    toBody: ({ body }: UpdateEventVariables) => body,
    toParams: ({ id }: UpdateEventVariables) => ({ householdId, eventId: id }),
    toQuery: ({ date }: UpdateEventVariables) => ({ date }),
    reasons: [],
    failureMessage: ({ body }: UpdateEventVariables) => CALENDAR_COPY.eventUpdateFailed(body.title),
    successMessage: (_variables: UpdateEventVariables, saved: IEvent) =>
      CALENDAR_COPY.eventUpdated(saved.title),
    onSuccess: (saved) => patchEventWindows({ queryClient, id: saved.id, event: saved }),
  });

  const deleteEvent = useApiMutation<DeleteEventVariables, undefined, never>({
    name: MutationName.deleteEvent,
    service: WebService.event,
    method: DELETE,
    toBody: () => undefined,
    toParams: ({ id }: DeleteEventVariables) => ({ householdId, eventId: id }),
    toQuery: ({ date }: DeleteEventVariables) => ({ date }),
    reasons: [],
    failureMessage: ({ title }: DeleteEventVariables) => CALENDAR_COPY.eventDeleteFailed(title),
    successMessage: ({ title }: DeleteEventVariables) => CALENDAR_COPY.eventDeleted(title),
    onSuccess: (_removed, { id }) => patchEventWindows({ queryClient, id }),
  });

  return { createEvent, updateEvent, deleteEvent };
};
