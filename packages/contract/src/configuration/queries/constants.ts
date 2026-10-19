export enum QueryName {
  me = 'me',
}

export const QUERY_NAMES = Object.values(QueryName);

export const DEFAULT_ENTRY = 'default';

export const QUERY_BOUNDS = {
  timeMs: { min: 0, max: 3_600_000 },
  retry: { min: 0, max: 5 },
} as const;
