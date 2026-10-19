import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { CONFIGURATION_KEY } from '../constants';
import { configurationStore } from '../store';

export const setConfiguration = (configuration: WebConfiguration): void => {
  configurationStore.set(CONFIGURATION_KEY, configuration);
};
