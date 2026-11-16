import type { HouseholdRouteHandler } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import {
  CREATE_EVENT_ROUTE,
  CREATE_RULE_ROUTE,
  LIST_EVENTS_ROUTE,
  LIST_RULES_ROUTE,
  OVERRIDE_OCCURRENCE_ROUTE,
  REMOVE_EVENT_ROUTE,
  REMOVE_RULE_ROUTE,
  SKIP_OCCURRENCE_ROUTE,
  UPDATE_EVENT_ROUTE,
  UPDATE_RULE_ROUTE,
} from '../constants.ts';
import { createEvent } from '../handlers/create/index.ts';
import { listEvents } from '../handlers/list/index.ts';
import { overrideOccurrence } from '../handlers/occurrences/override/index.ts';
import { skipOccurrence } from '../handlers/occurrences/skip/index.ts';
import { removeEvent } from '../handlers/remove/index.ts';
import { createRule } from '../handlers/rules/create/index.ts';
import { listRules } from '../handlers/rules/list/index.ts';
import { removeRule } from '../handlers/rules/remove/index.ts';
import { updateRule } from '../handlers/rules/update/index.ts';
import { updateEvent } from '../handlers/update/index.ts';

export const ENDPOINTS: ReadonlyMap<string, HouseholdRouteHandler> = new Map<
  string,
  HouseholdRouteHandler
>([
  [LIST_EVENTS_ROUTE, listEvents],
  [CREATE_EVENT_ROUTE, createEvent],
  [UPDATE_EVENT_ROUTE, updateEvent],
  [REMOVE_EVENT_ROUTE, removeEvent],
  [LIST_RULES_ROUTE, listRules],
  [CREATE_RULE_ROUTE, createRule],
  [UPDATE_RULE_ROUTE, updateRule],
  [REMOVE_RULE_ROUTE, removeRule],
  [SKIP_OCCURRENCE_ROUTE, skipOccurrence],
  [OVERRIDE_OCCURRENCE_ROUTE, overrideOccurrence],
]);
