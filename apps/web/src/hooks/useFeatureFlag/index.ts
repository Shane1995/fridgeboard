import { WebFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';
import { useRemoteConfig } from '../useRemoteConfig';

export const useFeatureFlag = (flag: WebFeatureFlag): boolean =>
  useRemoteConfig().featureFlags[flag];
