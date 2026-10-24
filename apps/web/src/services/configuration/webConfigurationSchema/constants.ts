import { UNSAFE_URL_PATTERN } from '../base/constants';

export const WEB_CONFIGURATION_VERSION = 2;

export const SAME_ORIGIN_PATH_PATTERN = /^\/(?!\/)[^\\\s]*$/;

export const API_URL_PATTERN = /^\/api\//;

export const SAFE_URL_PATTERN = new RegExp(`^(?!.*(?:${UNSAFE_URL_PATTERN.source})).*$`);
