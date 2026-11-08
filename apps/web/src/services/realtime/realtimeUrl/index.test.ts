import { realtimeUrl } from '.';

describe('realtimeUrl', () => {
  it('uses wss for the AppSync realtime host', () => {
    expect(realtimeUrl({ realtimeHost: 'abc.appsync-realtime-api.eu-west-2.amazonaws.com' })).toBe(
      'wss://abc.appsync-realtime-api.eu-west-2.amazonaws.com/event/realtime',
    );
  });

  it('uses ws for a loopback host', () => {
    expect(realtimeUrl({ realtimeHost: '127.0.0.1:3001' })).toBe(
      'ws://127.0.0.1:3001/event/realtime',
    );
  });

  it('keeps wss for a look-alike host', () => {
    expect(realtimeUrl({ realtimeHost: '127.0.0.1.evil.com:3001' })).toBe(
      'wss://127.0.0.1.evil.com:3001/event/realtime',
    );
  });
});
