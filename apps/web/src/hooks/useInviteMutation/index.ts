import type {
  IInviteErrorResponse,
  IInviteRequest,
  IInviteResponse,
} from '@fridgeboard/contract/households';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { POST } from '../../services/session/constants';
import { useActiveHousehold } from '../useActiveHousehold';
import { useApiMutation } from '../useApiMutation';
import type { MutationResult } from '../useMutation/types';
import { INVITE_FAILURES } from './constants';

export const useInviteMutation = (): MutationResult<
  ApiResult<IInviteResponse, IInviteErrorResponse['reason']>,
  string
> => {
  const householdId = useActiveHousehold()?.id ?? '';
  return useApiMutation({
    name: MutationName.inviteToHousehold,
    service: WebService.householdInvites,
    method: POST,
    toBody: (email: string): IInviteRequest => ({ email }),
    toParams: () => ({ householdId }),
    reasons: INVITE_FAILURES,
  });
};
