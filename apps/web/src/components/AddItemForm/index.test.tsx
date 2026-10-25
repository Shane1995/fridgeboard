import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { SHOP_ASSIGNER_COPY } from '../ShopAssigner/constants';
import { ADD_ITEM_COPY } from './constants';
import { AddItemForm } from './index';

const choose = (item: HTMLElement) => {
  fireEvent.keyDown(item, { key: 'Enter' });
  fireEvent.keyUp(item, { key: 'Enter' });
};

const renderForm = async () => {
  await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
  await fakeShoppingList.createShop({ name: 'Market', color: ShopColor.Sky });
  const Wrapper = createShoppingListWrapper();
  render(
    <Wrapper>
      <AddItemForm />
    </Wrapper>,
  );
};

const pick = async (name: string) => {
  fireEvent.click(await screen.findByRole('button', { name: /^Assign to shops/ }));
  choose(await screen.findByRole('menuitemcheckbox', { name }));
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
};

describe('AddItemForm', () => {
  it('offers the separate-items choice only once two shops are picked', async () => {
    await renderForm();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    await pick('Express');
    expect(
      screen.queryByRole('checkbox', { name: ADD_ITEM_COPY.separate }),
    ).not.toBeInTheDocument();
    await pick('Market');

    expect(await screen.findByRole('checkbox', { name: ADD_ITEM_COPY.separate })).not.toBeChecked();
  });

  it('adds one item for each shop when separate items are chosen', async () => {
    await renderForm();
    await pick('Express');
    await pick('Market');
    fireEvent.click(await screen.findByRole('checkbox', { name: ADD_ITEM_COPY.separate }));

    fireEvent.change(screen.getByRole('textbox', { name: ADD_ITEM_COPY.inputLabel }), {
      target: { value: 'Apples' },
    });
    fireEvent.click(screen.getByRole('button', { name: ADD_ITEM_COPY.submit }));

    await waitFor(async () => expect(await fakeShoppingList.listItems()).toHaveLength(2));
  });

  it('adds a single item in both shops when the choice is left alone', async () => {
    await renderForm();
    await pick('Express');
    await pick('Market');

    fireEvent.change(screen.getByRole('textbox', { name: ADD_ITEM_COPY.inputLabel }), {
      target: { value: 'Apples' },
    });
    fireEvent.click(screen.getByRole('button', { name: ADD_ITEM_COPY.submit }));

    await waitFor(async () => expect(await fakeShoppingList.listItems()).toHaveLength(1));
    expect((await fakeShoppingList.listItems())[0]?.shopIds).toHaveLength(2);
  });

  it('names the assign button', async () => {
    await renderForm();

    expect(
      await screen.findByRole('button', { name: SHOP_ASSIGNER_COPY.assign }),
    ).toBeInTheDocument();
  });
});
