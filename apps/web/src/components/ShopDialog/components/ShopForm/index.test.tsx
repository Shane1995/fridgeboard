import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ShopColor, SHOP_SUCCESS_COPY } from '../../../../services/shoppingList/constants';
import { createShoppingListWrapper } from '../../../../testUtils/createShoppingListWrapper';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import { SHOP_FORM_COPY } from './constants';
import { ShopForm } from './index';

const setUp = async () => {
  const shop = await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
  const onDone = vi.fn();
  const Wrapper = createShoppingListWrapper();
  render(
    <Wrapper>
      <ShopForm shop={shop} onDone={onDone} />
    </Wrapper>,
  );
  return { shop, onDone };
};

describe('ShopForm deleting', () => {
  it('asks before deleting and does not delete yet', async () => {
    await setUp();

    fireEvent.click(screen.getByRole('button', { name: SHOP_FORM_COPY.delete }));

    expect(await screen.findByText(SHOP_FORM_COPY.confirmTitle('Express'))).toBeInTheDocument();
    expect(await fakeShoppingList.listShops()).toHaveLength(1);
  });

  it('deletes the shop, closes the form and says so once confirmed', async () => {
    const { onDone } = await setUp();
    fireEvent.click(screen.getByRole('button', { name: SHOP_FORM_COPY.delete }));

    fireEvent.click(await screen.findByRole('button', { name: SHOP_FORM_COPY.confirm }));

    await waitFor(async () => expect(await fakeShoppingList.listShops()).toEqual([]));
    expect(await screen.findByText(SHOP_SUCCESS_COPY.remove)).toBeInTheDocument();
    expect(onDone).toHaveBeenCalled();
  });

  it('keeps the shop when the dialog is cancelled', async () => {
    const { onDone } = await setUp();
    fireEvent.click(screen.getByRole('button', { name: SHOP_FORM_COPY.delete }));

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(await fakeShoppingList.listShops()).toHaveLength(1);
    expect(onDone).not.toHaveBeenCalled();
  });
});
