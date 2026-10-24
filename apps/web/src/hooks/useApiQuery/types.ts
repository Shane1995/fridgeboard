import type { WebService } from '../../services/configuration/schema/constants';

export type ApiQueryOptions = {
  name: string;
  service: WebService;
  params?: Record<string, string>;
  enabled?: boolean;
};
