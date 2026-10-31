import { servedConfiguration } from './index.ts';

describe('servedConfiguration', () => {
  it('serves the local web configuration file as it is', () => {
    const file = JSON.stringify({ featureFlags: { ENABLE_PASSKEYS: false }, version: 2 });

    const result = servedConfiguration(file);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(file);
  });
});
