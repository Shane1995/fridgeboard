import { useOverlayState } from '@heroui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppDialog } from '.';
import { APP_DIALOG_COPY } from './constants';

const Harness = ({ withFooter = false }: { withFooter?: boolean }) => {
  const state = useOverlayState({ defaultOpen: true });
  return (
    <>
      <p>{state.isOpen ? 'open' : 'closed'}</p>
      <AppDialog
        state={state}
        title="Edit event"
        footer={withFooter ? <button type="button">Footer action</button> : undefined}
      >
        <p>Dialog content</p>
      </AppDialog>
    </>
  );
};

describe('AppDialog', () => {
  it('shows a titled dialog with its content', async () => {
    render(<Harness />);

    const dialog = await screen.findByRole('dialog', { name: 'Edit event' });

    expect(dialog).toHaveTextContent('Dialog content');
  });

  it('always offers a close button', async () => {
    render(<Harness />);

    expect(await screen.findByRole('button', { name: APP_DIALOG_COPY.close })).toBeInTheDocument();
  });

  it('closes from the close button without changing anything', async () => {
    render(<Harness />);

    fireEvent.click(await screen.findByRole('button', { name: APP_DIALOG_COPY.close }));

    expect(await screen.findByText('closed')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Harness />);
    await screen.findByRole('dialog');

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(await screen.findByText('closed')).toBeInTheDocument();
  });

  it('shows a footer when it is given one', async () => {
    render(<Harness withFooter />);

    expect(await screen.findByRole('button', { name: 'Footer action' })).toBeInTheDocument();
  });

  it('leaves the footer out when there is none', async () => {
    render(<Harness />);
    await screen.findByRole('dialog');

    expect(screen.queryByRole('button', { name: 'Footer action' })).not.toBeInTheDocument();
  });
});
