export const ENDPOINT = 'http://127.0.0.1:8000';
export const TABLE_NAME = 'fridgeboard';
export const REGION = 'eu-west-2';
export const ORIGIN_SECRET = 'integration-origin-secret';
export const COMPOSE_SERVICE = 'dynamodb';
export const HANDLER_ENV: Record<string, string> = {
  AWS_ENDPOINT_URL_DYNAMODB: ENDPOINT,
  AWS_ACCESS_KEY_ID: 'local',
  AWS_SECRET_ACCESS_KEY: 'local',
  AWS_REGION: REGION,
  TABLE_NAME,
  API_ORIGIN_SECRET: ORIGIN_SECRET,
};
