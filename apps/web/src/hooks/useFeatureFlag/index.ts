import { DEFAULT_WEB_FLAGS } from '@fridgeboard/contract/configuration/flags/constants';
import { WebFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';
import { useConfigurationQuery } from '../useConfigurationQuery';

export const useFeatureFlag = (flag: WebFeatureFlag): boolean => {
  const { data } = useConfigurationQuery();
  return (data?.featureFlags ?? DEFAULT_WEB_FLAGS)[flag];
};
