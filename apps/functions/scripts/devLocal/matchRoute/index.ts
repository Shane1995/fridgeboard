import type { RouteEntry } from '../route/types.ts';
import type { RouteMatch } from './types.ts';

const PARAMETER = /^\{(\w+)\}$/;

const matchSegments = (pattern: string[], actual: string[]): Record<string, string> | undefined => {
  if (pattern.length !== actual.length) {
    return undefined;
  }
  const pairs = pattern.map((segment, index) => ({ segment, value: actual[index] ?? '' }));
  if (pairs.some(({ segment, value }) => !PARAMETER.test(segment) && segment !== value)) {
    return undefined;
  }
  return Object.fromEntries(
    pairs.flatMap(({ segment, value }) => {
      const name = PARAMETER.exec(segment)?.[1];
      return name === undefined ? [] : [[name, decodeURIComponent(value)]];
    }),
  );
};

// Matches API Gateway style keys such as `GET /api/v1/households/{householdId}/lists`.
// A route with fewer parameters wins, so `/me` beats `/{id}`.
export const matchRoute = (
  routes: ReadonlyMap<string, RouteEntry>,
  method: string,
  path: string,
): RouteMatch | undefined =>
  [...routes]
    .flatMap(([routeKey, entry]) => {
      const [routeMethod = '', routePath = ''] = routeKey.split(' ');
      const pathParameters =
        routeMethod === method ? matchSegments(routePath.split('/'), path.split('/')) : undefined;
      return pathParameters ? [{ routeKey, entry, pathParameters }] : [];
    })
    .sort((a, b) => Object.keys(a.pathParameters).length - Object.keys(b.pathParameters).length)[0];
