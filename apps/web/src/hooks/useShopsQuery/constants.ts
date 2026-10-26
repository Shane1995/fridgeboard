import { QueryName } from '../../services/configuration/schema/constants';

export const SHOPS_QUERY_KEY = QueryName.shops;

export const SHOPS_CHANGE_TYPES = ['shop'] as const;
export const SHOPS_CHANGE_KEYS = [SHOPS_QUERY_KEY] as const;
