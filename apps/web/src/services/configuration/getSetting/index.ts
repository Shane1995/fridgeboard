import type { WebSetting } from '@fridgeboard/contract/configuration/settings/types';
import { getStoredConfiguration } from '../getStoredConfiguration';

export const getSetting = (key: WebSetting): number => getStoredConfiguration().settings[key];
