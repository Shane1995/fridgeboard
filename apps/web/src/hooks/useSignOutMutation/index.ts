import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import { resolveServicePath } from '../../services/configuration/resolveServicePath';
import { signOut } from '../../services/session/signOut';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfig } from '../useRemoteConfig';

export const useSignOutMutation = (): MutationResult<void, void> => {
  const { services } = useRemoteConfig();
  return useMutation({
    mutationFn: () => signOut(resolveServicePath(services, WebService.signOut)),
    mutationKey: [MutationName.signOut],
  });
};
