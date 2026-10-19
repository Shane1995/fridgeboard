import { WebFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';
import { useRemoteConfigContext } from '../useRemoteConfigContext';

export const useFeatureFlag = (flag: WebFeatureFlag): boolean =>
  useRemoteConfigContext().featureFlags[flag];
