export const CONFIGURATION_VERSION = 1;
export const PLACEHOLDER_PATTERN = /\{([A-Za-z0-9_]+)\}/g;

export const PARAM_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]{0,31}$/;
export const PARAM_VALUE_PATTERN = /^[A-Za-z0-9_-]{1,16}$/;
export const UNSAFE_URL_PATTERN = /\.\.|[%?#\\\s]|\/\//;
