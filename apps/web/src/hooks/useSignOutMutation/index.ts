import { MutationName } from '../../services/configuration/schema/constants';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useSessionContext } from '../useSessionContext';

export const useSignOutMutation = (): MutationResult<void, void> => {
  const { signOut } = useSessionContext();
  return useMutation({
    mutationFn: () => signOut(),
    mutationKey: [MutationName.signOut],
    retryable: true,
  });
};
