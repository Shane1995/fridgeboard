import type { WebService } from '../../services/configuration/schema/constants';

export type ApiQueryOptions<TResponse, TData> = {
  name: string;
  service: WebService;
  params?: Record<string, string>;
  query?: () => Record<string, string>;
  enabled?: boolean;
  select?: (response: TResponse) => TData;
};
