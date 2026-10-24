import { DEV_ENV, DYNAMO_PORT, TABLE_NAME } from './constants.ts';

describe('DEV_ENV', () => {
  it('points the handlers at the dev DynamoDB Local port and table', () => {
    expect(DEV_ENV.AWS_ENDPOINT_URL_DYNAMODB).toBe(`http://127.0.0.1:${DYNAMO_PORT}`);
    expect(DEV_ENV.TABLE_NAME).toBe(TABLE_NAME);
  });
});
