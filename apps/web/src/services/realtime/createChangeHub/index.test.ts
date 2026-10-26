import { createChangeHub } from '.';

const setup = () => {
  const invalidate = vi.fn();
  const hub = createChangeHub({ delayMs: 150, invalidate });
  return { hub, invalidate };
};

describe('createChangeHub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('subscribe', () => {
    it('tells listeners of a kind about its changes, and nobody else', () => {
      const { hub } = setup();
      const items = vi.fn();
      const shops = vi.fn();
      hub.subscribe({ topic: 'item', listener: items });
      hub.subscribe({ topic: 'shop', listener: shops });

      hub.emit([
        { type: 'item', id: 'a' },
        { type: 'shop', id: undefined },
      ]);

      expect(items).toHaveBeenCalledOnce();
      expect(items).toHaveBeenCalledWith({ type: 'item', id: 'a' });
      expect(shops).toHaveBeenCalledWith({ type: 'shop', id: undefined });
    });
  });

  describe('invalidateOn', () => {
    it('refreshes a list when one of its kinds changes, once for a burst', () => {
      const { hub, invalidate } = setup();
      hub.invalidateOn({ types: ['item', 'shop'], keys: ['items'] });
      hub.invalidateOn({ types: ['shop'], keys: ['shops'] });

      hub.emit([
        { type: 'item', id: 'a' },
        { type: 'item', id: 'b' },
        { type: 'shop', id: 's' },
      ]);
      expect(invalidate).not.toHaveBeenCalled();
      vi.advanceTimersByTime(150);

      expect(invalidate).toHaveBeenCalledOnce();
      expect(invalidate).toHaveBeenCalledWith(['items', 'shops']);
    });

    it('listens once however many components ask for the same list', () => {
      const { hub, invalidate } = setup();
      const stops = Array.from({ length: 17 }, () =>
        hub.invalidateOn({ types: ['item'], keys: ['items'] }),
      );

      stops.slice(0, 16).forEach((stop) => stop());
      hub.emit([{ type: 'item', id: 'a' }]);
      vi.advanceTimersByTime(150);
      expect(invalidate).toHaveBeenCalledOnce();

      stops[16]?.();
      invalidate.mockClear();
      hub.emit([{ type: 'item', id: 'b' }]);
      vi.advanceTimersByTime(150);
      expect(invalidate).not.toHaveBeenCalled();
    });

    it('keeps lists with different kinds or keys apart', () => {
      const { hub, invalidate } = setup();
      hub.invalidateOn({ types: ['shop'], keys: ['shops'] });

      hub.emit([{ type: 'item', id: 'a' }]);
      vi.advanceTimersByTime(500);

      expect(invalidate).not.toHaveBeenCalled();
    });

    it('ignores a second call to stop', () => {
      const { hub } = setup();
      const stop = hub.invalidateOn({ types: ['item'], keys: ['items'] });

      stop();

      expect(() => stop()).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('drops a refresh that is waiting', () => {
      const { hub, invalidate } = setup();
      hub.invalidateOn({ types: ['item'], keys: ['items'] });
      hub.emit([{ type: 'item', id: 'a' }]);

      hub.dispose();
      vi.advanceTimersByTime(500);

      expect(invalidate).not.toHaveBeenCalled();
    });
  });
});
