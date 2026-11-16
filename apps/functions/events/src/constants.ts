import { HOUSEHOLD_PATH } from '@fridgeboard/lambda-kit/utils/resolveHousehold/constants.ts';

export const EVENT_TITLE_MAX_LENGTH = 80;
export const EVENT_NOTE_MAX_LENGTH = 500;
export const EVENT_WINDOW_MAX_DAYS = 62;
export const EVENT_REMINDER_MAX_MINUTES = 10080;
export const ISO_UTC_INSTANT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/;
export const RULE_INTERVAL_MAX = 52;
export const RULES_MAX_PER_HOUSEHOLD = 50;
export const RULE_SKIPS_MAX = 200;
export const WEEKDAY_MAX = 6;
export const RULE_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export const RULE_FREQUENCIES: readonly string[] = ['daily', 'weekly', 'monthly'];
export const HOUSEHOLD_OWNER_ID = 'household';
export const LONDON_TIME_ZONE = 'Europe/London';

export const LIST_EVENTS_ROUTE = `GET ${HOUSEHOLD_PATH}/events`;
export const CREATE_EVENT_ROUTE = `POST ${HOUSEHOLD_PATH}/events`;
export const UPDATE_EVENT_ROUTE = `PATCH ${HOUSEHOLD_PATH}/events/{eventId}`;
export const REMOVE_EVENT_ROUTE = `DELETE ${HOUSEHOLD_PATH}/events/{eventId}`;
export const LIST_RULES_ROUTE = `GET ${HOUSEHOLD_PATH}/event-rules`;
export const CREATE_RULE_ROUTE = `POST ${HOUSEHOLD_PATH}/event-rules`;
export const UPDATE_RULE_ROUTE = `PATCH ${HOUSEHOLD_PATH}/event-rules/{ruleId}`;
export const REMOVE_RULE_ROUTE = `DELETE ${HOUSEHOLD_PATH}/event-rules/{ruleId}`;
export const SKIP_OCCURRENCE_ROUTE = `DELETE ${HOUSEHOLD_PATH}/event-rules/{ruleId}/occurrences/{date}`;
export const OVERRIDE_OCCURRENCE_ROUTE = `POST ${HOUSEHOLD_PATH}/event-rules/{ruleId}/occurrences/{date}`;
