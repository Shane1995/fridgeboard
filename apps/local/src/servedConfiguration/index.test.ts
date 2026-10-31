import { servedConfiguration } from './index.ts';

describe('servedConfiguration', () => {
  it('switches the passkey flag off and keeps the rest', () => {
    const file = JSON.stringify({
      featureFlags: { ENABLE_PASSKEYS: true, OTHER: true },
      version: 2,
    });

    const body = JSON.parse(String(servedConfiguration(file).body));

    expect(body).toMatchObject({
      featureFlags: { ENABLE_PASSKEYS: false, OTHER: true },
      version: 2,
    });
  });

  it('points live sync at the local stand-in and keeps other services', () => {
    const file = JSON.stringify({ services: { api: { endpoints: {} } } });

    const body = JSON.parse(String(servedConfiguration(file).body));

    expect(body.services).toEqual({
      api: { endpoints: {} },
      realtime: { realtimeHost: '127.0.0.1:3001', httpHost: '127.0.0.1:3001' },
    });
  });
});
