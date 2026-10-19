import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { configurationStore } from '../store';

export const setConfiguration = (configuration: WebConfiguration): void => {
  configurationStore.current = configuration;
};
