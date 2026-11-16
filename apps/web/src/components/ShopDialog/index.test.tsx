import { useOverlayState } from '@heroui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { APP_DIALOG_COPY } from '../AppDialog/constants';
import { SHOP_DIALOG_COPY } from './constants';
import { ShopDialog } from '.';

const Harness = () => {
  const state = useOverlayState({ defaultOpen: true });
  return (
    <>
      <p>{state.isOpen ? 'open' : 'closed'}</p>
      <ShopDialog state={state} />
    </>
  );
};

describe('ShopDialog', () => {
  it('can be closed without adding a shop', async () => {
    render(<Harness />, { wrapper: createShoppingListWrapper() });
    await screen.findByRole('dialog', { name: SHOP_DIALOG_COPY.createTitle });

    fireEvent.click(screen.getByRole('button', { name: APP_DIALOG_COPY.close }));

    expect(await screen.findByText('closed')).toBeInTheDocument();
  });

  it('does not focus the name field on a touch device, so the keyboard stays closed', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Harness />, { wrapper: createShoppingListWrapper() });

    expect(await screen.findByRole('textbox', { name: /name/i })).not.toHaveFocus();
    vi.unstubAllGlobals();
  });

  it('focuses the name field when the device has a fine pointer', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Harness />, { wrapper: createShoppingListWrapper() });

    expect(await screen.findByRole('textbox', { name: /name/i })).toHaveFocus();
    vi.unstubAllGlobals();
  });
});
