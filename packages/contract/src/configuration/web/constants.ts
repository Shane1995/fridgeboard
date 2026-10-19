import { CONFIGURATION_VERSION, UNSAFE_URL_PATTERN } from '../base/constants.ts';
import { DEFAULT_WEB_FLAGS } from '../flags/constants.ts';
import { DEFAULT_WEB_PARAMS, DEFAULT_WEB_SERVICES } from '../services/constants.ts';
import { DEFAULT_WEB_SETTINGS } from '../settings/constants.ts';
import type { WebConfiguration } from './types.ts';

export const SAME_ORIGIN_PATH_PATTERN = /^\/(?!\/)[^\\\s]*$/;

export const API_URL_PATTERN = /^\/api\//;

export const SAFE_URL_PATTERN = new RegExp(`^(?!.*(?:${UNSAFE_URL_PATTERN.source})).*$`);

export const DEFAULT_WEB_CONFIGURATION: WebConfiguration = {
  version: CONFIGURATION_VERSION,
  featureFlags: DEFAULT_WEB_FLAGS,
  params: DEFAULT_WEB_PARAMS,
  services: DEFAULT_WEB_SERVICES,
  settings: DEFAULT_WEB_SETTINGS,
  queries: {},
  mutations: {},
};
