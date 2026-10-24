import type { MutationName, WebService } from '../../services/configuration/schema/constants';

export type OptimisticChange<TVariables, TCache> = {
  queryKey: readonly unknown[];
  update: (change: { current: TCache; variables: TVariables }) => TCache;
};

export type ApiMutationOptions<TVariables, TResponse, TReason extends string, TCache = unknown> = {
  name: MutationName;
  service: WebService;
  method: string;
  toBody: (variables: TVariables) => unknown;
  toParams?: (variables: TVariables) => Record<string, string>;
  reasons: readonly TReason[];
  onSuccess: (response: TResponse, variables: TVariables) => void;
  optimistic?: OptimisticChange<TVariables, TCache>;
};
