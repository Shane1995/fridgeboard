import type { MutationName } from '../../services/configuration/mutations/constants';
import type { WebService } from '../../services/configuration/services/constants';

export type ApiMutationOptions<TVariables, TResponse, TReason extends string> = {
  name: MutationName;
  service: WebService;
  method: string;
  toBody: (variables: TVariables) => unknown;
  reasons: readonly TReason[];
  onSuccess: (response: TResponse) => void;
};
