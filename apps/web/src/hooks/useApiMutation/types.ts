import type { MutationName } from '../../services/configuration/schema/constants';
import type { WebService } from '../../services/configuration/schema/constants';

export type ApiMutationOptions<TVariables, TResponse, TReason extends string> = {
  name: MutationName;
  service: WebService;
  method: string;
  toBody: (variables: TVariables) => unknown;
  reasons: readonly TReason[];
  onSuccess: (response: TResponse) => void;
};
