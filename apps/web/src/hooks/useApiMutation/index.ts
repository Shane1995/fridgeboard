import type { ApiResult } from '../../services/api/sendJson/types';
import { sendJson } from '../../services/api/sendJson';
import { resolveEndpoint } from '../../services/configuration/resolveEndpoint';
import { mergedEntry } from '../../utils/mergedEntry';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import type { ApiMutationOptions } from './types';

// A signed-in JSON request to one API service. The URL and timeout come from the remote
// configuration by service and name, so a new mutation only supplies its body, its known failure
// reasons and what to do with the response.
export const useApiMutation = <TVariables, TResponse, TReason extends string>({
  name,
  service,
  method,
  toBody,
  reasons,
  onSuccess,
}: ApiMutationOptions<TVariables, TResponse, TReason>): MutationResult<
  ApiResult<TResponse, TReason>,
  TVariables
> => {
  const { services, mutations } = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  return useMutation({
    mutationKey: [name],
    mutationFn: async (variables: TVariables) => {
      const result = await sendJson<TResponse, TReason>(
        resolveEndpoint(services.api, service, mergedEntry(mutations, name).timeoutMs),
        method,
        toBody(variables),
        reasons,
        apiFetch,
      );
      if (result.ok) {
        onSuccess(result.data);
      }
      return result;
    },
  });
};
