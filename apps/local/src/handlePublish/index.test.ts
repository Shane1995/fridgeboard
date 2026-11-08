import { createRealtimeHub } from '../realtimeHub/index.ts';
import { handlePublish } from './index.ts';

const publish = (body: unknown) => {
  const hub = createRealtimeHub();
  const subscriber = { id: 's', send: vi.fn() };
  hub.subscribe({ channel: '/hh/hh-1', subscriber });
  const result = handlePublish({ body: JSON.stringify(body), hub });
  return { result, subscriber };
};

describe('handlePublish', () => {
  it('fans the events out and reports each as successful', () => {
    const { result, subscriber } = publish({ channel: '/hh/hh-1', events: ['a', 'b'] });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(String(result.body))).toEqual({
      successful: [
        { identifier: '0', index: 0 },
        { identifier: '1', index: 1 },
      ],
      failed: [],
    });
    expect(subscriber.send).toHaveBeenCalledTimes(2);
  });

  it.each([
    [{ channel: '/other/x', events: ['a'] }],
    [{ channel: '/hh/hh-1', events: [] }],
    [{ channel: '/hh/hh-1', events: ['1', '2', '3', '4', '5', '6'] }],
    [{ channel: '/hh/hh-1', events: [1] }],
    [{ events: ['a'] }],
  ])('rejects %j', (body) => {
    expect(publish(body).result.statusCode).toBe(400);
  });

  it('rejects a body that is not JSON', () => {
    expect(handlePublish({ body: '{', hub: createRealtimeHub() }).statusCode).toBe(400);
  });
});
