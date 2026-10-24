import type {
  ICreateHouseholdErrorResponse,
  ICreateHouseholdRequest,
  ICreateHouseholdResponse,
} from '@fridgeboard/contract/households';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName } from '../../services/configuration/schema/constants';
import { WebService } from '../../services/configuration/schema/constants';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { useApiMutation } from '../useApiMutation';
import { useCompleteOnboardingSection } from '../useCompleteOnboardingSection';
import type { MutationResult } from '../useMutation/types';
import { HOUSEHOLD_FAILURES } from './constants';

export const useCreateHouseholdMutation = (): MutationResult<
  ApiResult<ICreateHouseholdResponse, ICreateHouseholdErrorResponse['reason']>,
  string
> => {
  const completeSection = useCompleteOnboardingSection();
  return useApiMutation({
    name: MutationName.createHousehold,
    service: WebService.households,
    method: 'POST',
    toBody: (name: string): ICreateHouseholdRequest => ({ name }),
    reasons: HOUSEHOLD_FAILURES,
    onSuccess: () => completeSection(OnboardingSectionId.Household),
  });
};
