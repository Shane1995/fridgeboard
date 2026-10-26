import { createEventBus } from '.';

describe('createEventBus', () => {
  it('tells every listener of a topic about an event, and nobody else', () => {
    const bus = createEventBus<'item' | 'shop', string>();
    const first = vi.fn();
    const second = vi.fn();
    const other = vi.fn();
    bus.subscribe({ topic: 'item', listener: first });
    bus.subscribe({ topic: 'item', listener: second });
    bus.subscribe({ topic: 'shop', listener: other });

    bus.emit({ topic: 'item', event: 'milk' });

    expect(first).toHaveBeenCalledWith('milk');
    expect(second).toHaveBeenCalledWith('milk');
    expect(other).not.toHaveBeenCalled();
  });

  it('stops telling a listener once it unsubscribes', () => {
    const bus = createEventBus<'item', string>();
    const listener = vi.fn();
    const unsubscribe = bus.subscribe({ topic: 'item', listener });

    unsubscribe();
    bus.emit({ topic: 'item', event: 'milk' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('does nothing for a topic nobody listens to', () => {
    const bus = createEventBus<'item', string>();

    expect(() => bus.emit({ topic: 'item', event: 'milk' })).not.toThrow();
  });

  it('lets a listener unsubscribe itself while it is being told', () => {
    const bus = createEventBus<'item', string>();
    const later = vi.fn();
    const unsubscribe = bus.subscribe({
      topic: 'item',
      listener: () => {
        unsubscribe();
      },
    });
    bus.subscribe({ topic: 'item', listener: later });

    bus.emit({ topic: 'item', event: 'milk' });
    bus.emit({ topic: 'item', event: 'eggs' });

    expect(later).toHaveBeenCalledTimes(2);
  });
});
