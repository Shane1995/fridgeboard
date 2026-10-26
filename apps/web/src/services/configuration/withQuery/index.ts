import type { Endpoint } from '../types';
import type { WithQueryOptions } from './types';

export const withQuery = ({ endpoint, query }: WithQueryOptions): Endpoint => {
  const search = new URLSearchParams(query).toString();
  return search === '' ? endpoint : { ...endpoint, path: `${endpoint.path}?${search}` };
};
