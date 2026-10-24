import { useOverlayState } from '@heroui/react';
import { render, screen } from '@testing-library/react';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import type { ListItem } from '../../services/shoppingList/types';
import { ITEM_INFO_COPY } from './constants';
import { ItemInfoDialog } from './index';

const ITEM: ListItem = {
  id: 'i1',
  name: 'Milk',
  bucketId: 'b1',
  checked: false,
  createdAt: new Date(2026, 9, 24, 21, 31).getTime(),
  addedBy: 'sub-1',
};

const Open = ({ item }: { item: ListItem }) => {
  const state = useOverlayState({ defaultOpen: true });
  return <ItemInfoDialog item={item} state={state} />;
};

describe('ItemInfoDialog', () => {
  it('shows the item with who added it and when', async () => {
    const Wrapper = createShoppingListWrapper();
    render(
      <Wrapper>
        <Open item={ITEM} />
      </Wrapper>,
    );

    expect(await screen.findByRole('heading', { name: 'Milk' })).toBeInTheDocument();
    expect(await screen.findByText('shane')).toBeInTheDocument();
    expect(screen.getByText(/24 Oct 2026/)).toBeInTheDocument();
  });

  it('shows only the date when nobody is recorded', async () => {
    const { addedBy: _omitted, ...withoutAuthor } = ITEM;
    const Wrapper = createShoppingListWrapper();
    render(
      <Wrapper>
        <Open item={withoutAuthor} />
      </Wrapper>,
    );

    expect(await screen.findByText(/24 Oct 2026/)).toBeInTheDocument();
    expect(screen.queryByText(ITEM_INFO_COPY.addedBy, { exact: false })).not.toBeInTheDocument();
  });
});
