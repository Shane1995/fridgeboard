import { useQueryClient } from '@tanstack/react-query';
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
// reasons and what to do with the response. An `optimistic` change is written to the cache before
// the request and put back if the request fails.
export const useApiMutation = <TVariables, TResponse, TReason extends string, TCache = unknown>({
  name,
  service,
  method,
  toBody,
  toParams,
  reasons,
  onSuccess,
  optimistic,
}: ApiMutationOptions<TVariables, TResponse, TReason, TCache>): MutationResult<
  ApiResult<TResponse, TReason>,
  TVariables
> => {
  const { services, mutations } = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [name],
    mutationFn: async (variables: TVariables) => {
      const endpoint = resolveEndpoint({
        api: services.api,
        service,
        timeoutMs: mergedEntry(mutations, name).timeoutMs,
        ...(toParams === undefined ? {} : { params: toParams(variables) }),
      });
      if (optimistic !== undefined) {
        await queryClient.cancelQueries({ queryKey: optimistic.queryKey });
      }
      const snapshot =
        optimistic === undefined
          ? undefined
          : queryClient.getQueryData<TCache>(optimistic.queryKey);
      const restore = () => {
        if (optimistic !== undefined && snapshot !== undefined) {
          queryClient.setQueryData(optimistic.queryKey, snapshot);
        }
      };
      if (optimistic !== undefined && snapshot !== undefined) {
        queryClient.setQueryData(
          optimistic.queryKey,
          optimistic.update({ current: snapshot, variables }),
        );
      }
      const result = await sendJson<TResponse, TReason>(
        endpoint,
        method,
        toBody(variables),
        reasons,
        apiFetch,
      ).catch((error: unknown) => {
        restore();
        throw error;
      });
      if (result.ok) {
        onSuccess?.(result.data, variables);
      } else {
        restore();
      }
      return result;
    },
  });
};
