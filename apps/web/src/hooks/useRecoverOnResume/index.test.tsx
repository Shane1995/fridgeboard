import { fireEvent, render, screen } from '@testing-library/react';
import { useRecoverOnResume } from './index';

const Probe = ({ onKey }: { onKey: (key: string) => void }) => {
  useRecoverOnResume();
  return (
    <div onKeyDown={(event) => onKey(event.key)}>
      <button type="button">menu button</button>
      <input aria-label="field" />
    </div>
  );
};

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  fireEvent(document, new Event('visibilitychange'));
};

describe('useRecoverOnResume', () => {
  afterEach(() => {
    setVisibility('visible');
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
  });

  it('presses Escape when the app comes back to the foreground', () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    screen.getByRole('button').focus();

    setVisibility('hidden');
    expect(onKey).not.toHaveBeenCalled();
    setVisibility('visible');

    expect(onKey).toHaveBeenCalledWith('Escape');
  });

  it('leaves the user alone while they are typing', () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    screen.getByRole('textbox').focus();

    setVisibility('visible');

    expect(onKey).not.toHaveBeenCalled();
  });

  it('frees a stuck page scroll lock when nothing is open', () => {
    render(<Probe onKey={vi.fn()} />);
    document.documentElement.style.overflow = 'hidden';

    setVisibility('visible');

    expect(document.documentElement.style.overflow).toBe('');
  });

  it('keeps the scroll lock while a dialog is still open', () => {
    render(<Probe onKey={vi.fn()} />);
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    document.body.append(dialog);
    document.documentElement.style.overflow = 'hidden';

    setVisibility('visible');
    dialog.remove();

    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('stops listening when unmounted', () => {
    const onKey = vi.fn();
    const { unmount } = render(<Probe onKey={onKey} />);
    unmount();

    setVisibility('visible');

    expect(onKey).not.toHaveBeenCalled();
  });
});
