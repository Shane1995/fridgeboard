import type { RouteEntry } from '../route/types.ts';

export type RouteMatch = {
  routeKey: string;
  entry: RouteEntry;
  pathParameters: Record<string, string>;
};
