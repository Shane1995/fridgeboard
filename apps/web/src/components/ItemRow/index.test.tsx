import { fireEvent, render, screen } from '@testing-library/react';
import { BucketColor, UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import type { Bucket, ListItem } from '../../services/shoppingList/types';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { ITEM_ROW_COPY } from './constants';
import { ItemRow } from './index';

const ITEM: ListItem = {
  id: 'i1',
  name: 'Milk',
  bucketId: UNSORTED_BUCKET_ID,
  checked: false,
  createdAt: 0,
};
const EXPRESS: Bucket = { id: 'b1', name: 'Express', color: BucketColor.Mint, order: 0 };

const renderRow = () => {
  const Wrapper = createShoppingListWrapper();
  render(
    <Wrapper>
      <ul>
        <ItemRow item={ITEM} moveTargets={[EXPRESS]} />
      </ul>
    </Wrapper>,
  );
};

describe('ItemRow', () => {
  it('shows the item with a tick box', () => {
    renderRow();

    expect(screen.getByRole('checkbox', { name: 'Milk' })).not.toBeChecked();
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('offers Info, Move and Delete in the menu, with the buckets one step further in', async () => {
    renderRow();

    fireEvent.click(screen.getByRole('button', { name: ITEM_ROW_COPY.menu }));

    expect(await screen.findByRole('menuitem', { name: ITEM_ROW_COPY.info })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.move })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.delete })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Express' })).not.toBeInTheDocument();
  });
});
