import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { useRemoteConfigContext } from '../useRemoteConfigContext';

export const useFeatureFlag = (flag: WebFeatureFlag): boolean =>
  useRemoteConfigContext().featureFlags[flag];
