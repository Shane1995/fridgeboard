import type { IEvent, IEventRule } from '@fridgeboard/contract/events';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveHousehold } from '../../../../hooks/useActiveHousehold';
import { useApiMutation } from '../../../../hooks/useApiMutation';
import type { MutationResult } from '../../../../hooks/useMutation/types';
import type { ApiResult } from '../../../../services/api/sendJson/types';
import {
  MutationName,
  QueryName,
  WebService,
} from '../../../../services/configuration/schema/constants';
import { DELETE, PATCH, POST } from '../../../../services/session/constants';
import { CALENDAR_COPY } from '../../constants';
import type {
  CreateRuleVariables,
  DeleteRuleVariables,
  OverrideOccurrenceVariables,
  SkipOccurrenceVariables,
  UpdateRuleVariables,
} from './types';

type EventRuleMutations = {
  createRule: MutationResult<ApiResult<IEventRule, never>, CreateRuleVariables>;
  updateRule: MutationResult<ApiResult<IEventRule, never>, UpdateRuleVariables>;
  deleteRule: MutationResult<ApiResult<undefined, never>, DeleteRuleVariables>;
  skipOccurrence: MutationResult<ApiResult<undefined, never>, SkipOccurrenceVariables>;
  overrideOccurrence: MutationResult<ApiResult<IEvent, never>, OverrideOccurrenceVariables>;
};

// A repeating series changes many days at once, so unlike a single event the cached months cannot
// be patched by hand: every cached month is read again after a change.
export const useEventRuleMutations = (): EventRuleMutations => {
  const queryClient = useQueryClient();
  const householdId = useActiveHousehold()?.id ?? '';
  const refreshMonths = () => void queryClient.invalidateQueries({ queryKey: [QueryName.events] });

  const createRule = useApiMutation<CreateRuleVariables, IEventRule, never>({
    name: MutationName.createEventRule,
    service: WebService.eventRules,
    method: POST,
    toBody: ({ body }) => body,
    toParams: () => ({ householdId }),
    reasons: [],
    failureMessage: ({ title }) => CALENDAR_COPY.eventAddFailed(title),
    successMessage: ({ title }) => CALENDAR_COPY.eventAdded(title),
    onSuccess: refreshMonths,
  });

  const updateRule = useApiMutation<UpdateRuleVariables, IEventRule, never>({
    name: MutationName.updateEventRule,
    service: WebService.eventRule,
    method: PATCH,
    toBody: ({ body }) => body,
    toParams: ({ ruleId }) => ({ householdId, ruleId }),
    reasons: [],
    failureMessage: ({ title }) => CALENDAR_COPY.eventUpdateFailed(title),
    successMessage: ({ title }) => CALENDAR_COPY.eventUpdated(title),
    onSuccess: refreshMonths,
  });

  const deleteRule = useApiMutation<DeleteRuleVariables, undefined, never>({
    name: MutationName.deleteEventRule,
    service: WebService.eventRule,
    method: DELETE,
    toBody: () => undefined,
    toParams: ({ ruleId }) => ({ householdId, ruleId }),
    reasons: [],
    failureMessage: ({ title }) => CALENDAR_COPY.eventDeleteFailed(title),
    successMessage: ({ title }) => CALENDAR_COPY.eventDeleted(title),
    onSuccess: refreshMonths,
  });

  const skipOccurrence = useApiMutation<SkipOccurrenceVariables, undefined, never>({
    name: MutationName.skipOccurrence,
    service: WebService.eventOccurrence,
    method: DELETE,
    toBody: () => undefined,
    toParams: ({ ruleId, date }) => ({ householdId, ruleId, date }),
    reasons: [],
    failureMessage: ({ title }) => CALENDAR_COPY.eventDeleteFailed(title),
    successMessage: ({ title }) => CALENDAR_COPY.occurrenceSkipped(title),
    onSuccess: refreshMonths,
  });

  const overrideOccurrence = useApiMutation<OverrideOccurrenceVariables, IEvent, never>({
    name: MutationName.overrideOccurrence,
    service: WebService.eventOccurrence,
    method: POST,
    toBody: ({ body }) => body,
    toParams: ({ ruleId, date }) => ({ householdId, ruleId, date }),
    reasons: [],
    failureMessage: ({ title }) => CALENDAR_COPY.eventUpdateFailed(title),
    successMessage: ({ title }) => CALENDAR_COPY.eventUpdated(title),
    onSuccess: refreshMonths,
  });

  return { createRule, updateRule, deleteRule, skipOccurrence, overrideOccurrence };
};
