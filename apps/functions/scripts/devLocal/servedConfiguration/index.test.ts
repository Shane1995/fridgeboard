import { servedConfiguration } from './index.ts';

describe('servedConfiguration', () => {
  it('switches the passkey flag off and keeps the rest', () => {
    const file = JSON.stringify({
      featureFlags: { ENABLE_PASSKEYS: true, OTHER: true },
      version: 2,
    });

    const body = JSON.parse(String(servedConfiguration(file).body));

    expect(body).toEqual({ featureFlags: { ENABLE_PASSKEYS: false, OTHER: true }, version: 2 });
  });
});
