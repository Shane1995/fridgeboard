import { QueryName } from '../../services/configuration/schema/constants';

export const ITEMS_QUERY_KEY = QueryName.items;

export const ITEMS_CHANGE_TYPES = ['item', 'shop'] as const;
export const ITEMS_CHANGE_KEYS = [ITEMS_QUERY_KEY] as const;
