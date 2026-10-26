import { QueryName } from '../../services/configuration/schema/constants';

export const SUGGESTIONS_QUERY_KEY = QueryName.suggestions;

export const SUGGESTIONS_CHANGE_TYPES = ['item'] as const;
export const SUGGESTIONS_CHANGE_KEYS = [SUGGESTIONS_QUERY_KEY] as const;
