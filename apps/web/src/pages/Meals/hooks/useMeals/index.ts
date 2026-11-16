import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { usePlanner } from '../usePlanner';

export const useMeals = () => ({
  enabled: useFeatureFlag(WebFeatureFlag.ENABLE_CALENDAR),
  planner: usePlanner(),
});
