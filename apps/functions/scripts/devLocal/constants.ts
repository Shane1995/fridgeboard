export const API_PORT = 3001;
export const DYNAMO_PORT = 8001;
export const DYNAMO_SERVICE = 'dynamodb-dev';
export const TABLE_NAME = 'fridgeboard';
export const REGION = 'eu-west-2';
export const ORIGIN_SECRET = 'dev-local-origin-secret';
export const ORIGIN_HEADER = 'x-api-origin-verify';
export const SERVER_BUNDLE = 'dist-dev/devLocal/server.mjs';
export const SERVER_ENTRY = 'scripts/devLocal/server/index.ts';
export const ESM_REQUIRE_BANNER =
  "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);";
export const CONFIGURATION_FILE = '../configuration/web/configuration.json';
export const SIGN_IN_CODE = '000000';
export const ADMIN_EMAIL = 'admin@fridgeboard.local';
export const MEMBER_INVITE_EMAIL = 'member@fridgeboard.local';
export const APP_INVITE_EMAIL = 'newcomer@fridgeboard.local';
export const ADMIN_GROUP = 'admin';
export const TOKEN_PREFIX = 'local.';
export const TOKEN_EXPIRES_IN = 3600;
export const REFRESH_COOKIE = 'fb_rt';
export const FLOW_COOKIE = 'fb_auth_flow';
export const COOKIE_PATH = '/api/v1/auth';
export const FLOW_MAX_AGE = 600;
export const REFRESH_MAX_AGE = 2592000;
export const INVITE_TTL_SECONDS = 604800;
export const DEV_ENV = {
  AWS_ENDPOINT_URL_DYNAMODB: `http://127.0.0.1:${DYNAMO_PORT}`,
  AWS_ACCESS_KEY_ID: 'local',
  AWS_SECRET_ACCESS_KEY: 'local',
  AWS_REGION: REGION,
  TABLE_NAME,
  API_ORIGIN_SECRET: ORIGIN_SECRET,
};
