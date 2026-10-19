import type { WebSetting } from '@fridgeboard/contract/configuration/settings/types';
import { configurationStore } from '../store';

export const getSetting = (key: WebSetting): number => configurationStore.current.settings[key];
