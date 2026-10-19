import { CONFIGURATION_VERSION } from '../base/constants.ts';
import { DEFAULT_WEB_FLAGS } from '../flags/constants.ts';
import type { WebConfiguration } from './types.ts';

export const SAME_ORIGIN_PATH_PATTERN = /^\/(?!\/)[^\\\s]*$/;

export const DEFAULT_WEB_CONFIGURATION: WebConfiguration = {
  version: CONFIGURATION_VERSION,
  featureFlags: DEFAULT_WEB_FLAGS,
  services: {},
};
