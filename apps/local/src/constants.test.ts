import { DEV_ENV, LOCALSTACK_PORT, TABLE_NAME } from './constants.ts';

describe('DEV_ENV', () => {
  it('points the handlers at LocalStack and the dev table', () => {
    expect(DEV_ENV.AWS_ENDPOINT_URL).toBe(`http://127.0.0.1:${LOCALSTACK_PORT}`);
    expect(DEV_ENV.TABLE_NAME).toBe(TABLE_NAME);
  });
});
