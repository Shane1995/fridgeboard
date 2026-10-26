import { touchDragListeners } from './index';

const touchStartOn = (target: Element) => {
  const onTouchStart = vi.fn();
  const { onTouchStart: handler } = touchDragListeners({ listeners: { onTouchStart } });
  handler({ target } as never);
  return onTouchStart;
};

describe('touchDragListeners', () => {
  it('starts a drag from a touch on plain content', () => {
    expect(touchStartOn(document.createElement('p'))).toHaveBeenCalledTimes(1);
  });

  it('leaves text inputs alone so they can be edited and selected', () => {
    expect(touchStartOn(document.createElement('input'))).not.toHaveBeenCalled();
  });

  it('copes with no listeners', () => {
    const { onTouchStart } = touchDragListeners({ listeners: undefined });

    expect(() => onTouchStart({ target: document.createElement('p') } as never)).not.toThrow();
  });
});
