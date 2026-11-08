import { createRealtimeHub } from './index.ts';

describe('createRealtimeHub', () => {
  it('sends each published event to every subscriber of the channel', () => {
    const hub = createRealtimeHub();
    const first = { id: 'a', send: vi.fn() };
    const second = { id: 'b', send: vi.fn() };
    const other = { id: 'c', send: vi.fn() };
    hub.subscribe({ channel: '/hh/1', subscriber: first });
    hub.subscribe({ channel: '/hh/1', subscriber: second });
    hub.subscribe({ channel: '/hh/2', subscriber: other });

    const delivered = hub.publish({ channel: '/hh/1', events: ['e1', 'e2'] });

    expect(delivered).toBe(2);
    expect(first.send).toHaveBeenCalledWith({ type: 'data', id: 'a', event: 'e1' });
    expect(first.send).toHaveBeenCalledWith({ type: 'data', id: 'a', event: 'e2' });
    expect(second.send).toHaveBeenCalledTimes(2);
    expect(other.send).not.toHaveBeenCalled();
  });

  it('stops delivering after unsubscribe', () => {
    const hub = createRealtimeHub();
    const subscriber = { id: 'a', send: vi.fn() };
    const unsubscribe = hub.subscribe({ channel: '/hh/1', subscriber });

    unsubscribe();

    expect(hub.publish({ channel: '/hh/1', events: ['e'] })).toBe(0);
    expect(subscriber.send).not.toHaveBeenCalled();
  });
});
