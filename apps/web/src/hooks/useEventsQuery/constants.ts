import { QueryName } from '../../services/configuration/schema/constants';

export const EVENTS_QUERY_KEY = QueryName.events;

export const EVENTS_CHANGE_TYPES = ['event'] as const;
export const EVENTS_CHANGE_KEYS = [EVENTS_QUERY_KEY] as const;
