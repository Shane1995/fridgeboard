import { signOut } from '../../services/session/signOut';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';

export const useSignOutMutation = (): MutationResult<void, void> =>
  useMutation({ mutationFn: signOut });
