import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useOverlayState } from '@heroui/react';
import { HOLD_TO_CONFIRM_MS } from './constants';
import { ConfirmDialog } from './index';

const Harness = ({
  onConfirm,
  startOpen = true,
  holdToConfirm = false,
}: {
  onConfirm: () => void;
  startOpen?: boolean;
  holdToConfirm?: boolean;
}) => {
  const state = useOverlayState({ defaultOpen: startOpen });
  return (
    <ConfirmDialog
      state={state}
      title="Delete Milk?"
      description="This cannot be undone."
      confirmLabel="Delete"
      onConfirm={onConfirm}
      holdToConfirm={holdToConfirm}
    />
  );
};

describe('ConfirmDialog', () => {
  it('shows the title, description and confirm label when open', async () => {
    render(<Harness onConfirm={vi.fn()} />);

    expect(await screen.findByText('Delete Milk?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('shows nothing while closed', () => {
    render(<Harness onConfirm={vi.fn()} startOpen={false} />);

    expect(screen.queryByText('Delete Milk?')).not.toBeInTheDocument();
  });

  it('calls onConfirm and closes when the confirm button is pressed', async () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Delete Milk?')).not.toBeInTheDocument());
  });

  it('closes without calling onConfirm when Cancel is pressed', async () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('Delete Milk?')).not.toBeInTheDocument());
  });

  describe('when the button has to be held', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    it('does nothing on a quick tap', async () => {
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} holdToConfirm />);

      const button = await screen.findByRole('button', { name: 'Delete' });
      fireEvent.pointerDown(button);
      fireEvent.pointerUp(button);
      fireEvent.click(button);
      act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS + 100));

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('confirms once the button has been held long enough', async () => {
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} holdToConfirm />);

      fireEvent.pointerDown(await screen.findByRole('button', { name: 'Delete' }));
      act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS));

      expect(onConfirm).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByText('Delete Milk?')).not.toBeInTheDocument());
    });

    it('starts again when released early', async () => {
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} holdToConfirm />);
      const button = await screen.findByRole('button', { name: 'Delete' });

      fireEvent.pointerDown(button);
      act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS - 200));
      fireEvent.pointerUp(button);
      fireEvent.pointerDown(button);
      act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS - 200));

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('confirms from a screen reader activation that sends only a click', async () => {
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} holdToConfirm />);

      fireEvent.click(await screen.findByRole('button', { name: 'Delete' }), { detail: 0 });

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('confirms when Enter is held on the keyboard', async () => {
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} holdToConfirm />);

      fireEvent.keyDown(await screen.findByRole('button', { name: 'Delete' }), { key: 'Enter' });
      act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('does not confirm when Enter is released early', async () => {
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} holdToConfirm />);
      const button = await screen.findByRole('button', { name: 'Delete' });

      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });
      act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS));

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
