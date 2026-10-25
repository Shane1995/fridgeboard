import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useToast } from '../../hooks/useToast';
import { ToastProvider } from './index';

const Buttons = ({ onMove }: { onMove: () => void }) => {
  const toast = useToast();
  return (
    <>
      <button onClick={() => toast.success('Milk added')}>success</button>
      <button onClick={() => toast.error('Could not add the item')}>error</button>
      <button onClick={() => toast.success('Moved Apples', { label: 'Undo', onPress: onMove })}>
        undoable
      </button>
      <button
        onClick={() =>
          toast.confirm({
            title: 'Move Apples?',
            description: 'From Tesco to Sainsburys',
            actions: [
              { label: 'Move', onPress: onMove },
              { label: 'Copy', onPress: vi.fn() },
            ],
          })
        }
      >
        confirm
      </button>
    </>
  );
};

const renderWithToasts = (onMove = vi.fn()) => {
  render(
    <ToastProvider>
      <Buttons onMove={onMove} />
    </ToastProvider>,
  );
  return onMove;
};

describe('ToastProvider', () => {
  it('shows a success message', async () => {
    renderWithToasts();

    fireEvent.click(screen.getByRole('button', { name: 'success' }));

    expect(await screen.findByText('Milk added')).toBeInTheDocument();
  });

  it('shows an error message', async () => {
    renderWithToasts();

    fireEvent.click(screen.getByRole('button', { name: 'error' }));

    expect(await screen.findByText('Could not add the item')).toBeInTheDocument();
  });

  it('shows a confirmation with a button for every choice', async () => {
    renderWithToasts();

    fireEvent.click(screen.getByRole('button', { name: 'confirm' }));

    expect(await screen.findByText('Move Apples?')).toBeInTheDocument();
    expect(screen.getByText('From Tesco to Sainsburys')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('runs the chosen action and closes the confirmation', async () => {
    const onMove = renderWithToasts();
    fireEvent.click(screen.getByRole('button', { name: 'confirm' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Move' }));

    expect(onMove).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Move Apples?')).not.toBeInTheDocument());
  });

  it('offers an Undo button on a success message, and runs it once', async () => {
    const onUndo = renderWithToasts();

    fireEvent.click(screen.getByRole('button', { name: 'undoable' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }));

    expect(onUndo).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Moved Apples')).not.toBeInTheDocument());
  });

  it('shows no buttons on a plain success message', async () => {
    renderWithToasts();

    fireEvent.click(screen.getByRole('button', { name: 'success' }));

    expect(await screen.findByText('Milk added')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
  });

  it('announces messages to assistive technology', async () => {
    renderWithToasts();

    fireEvent.click(screen.getByRole('button', { name: 'error' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not add the item');
  });
});
