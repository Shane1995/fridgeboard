import { act, waitFor } from '@testing-library/react';
import { ShopColor } from '../../../../../../services/shoppingList/constants';
import { fakeShoppingList } from '../../../../../../testUtils/fakeShoppingList';
import { renderHookWithHousehold } from '../../../../../../testUtils/createShoppingListWrapper';
import { useShopForm } from './index';

const submit = (result: { current: { handleSubmit: (event: never) => void } }) =>
  act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as never));

describe('useShopForm', () => {
  beforeEach(() => window.localStorage.clear());

  it('creates a shop with the trimmed name and chosen colour', async () => {
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useShopForm(undefined, onDone));

    act(() => {
      result.current.setName('  Express ');
      result.current.setColor(ShopColor.Grape);
    });
    submit(result);

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(await fakeShoppingList.listShops()).toMatchObject([
      { name: 'Express', color: ShopColor.Grape },
    ]);
  });

  it('starts from the shop being edited and saves the changes', async () => {
    const shop = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useShopForm(shop, onDone));
    expect(result.current.name).toBe('Express');
    expect(result.current.color).toBe(ShopColor.Mint);

    act(() => result.current.setName('Tesco'));
    submit(result);

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect((await fakeShoppingList.listShops())[0]?.name).toBe('Tesco');
  });

  it('deletes the shop being edited', async () => {
    const shop = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useShopForm(shop, onDone));

    act(() => result.current.handleDelete());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(await fakeShoppingList.listShops()).toEqual([]);
  });

  it('has nothing to delete when creating', async () => {
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useShopForm(undefined, onDone));

    act(() => result.current.handleDelete());

    expect(onDone).not.toHaveBeenCalled();
  });

  it('ignores a blank name', async () => {
    const onDone = vi.fn();
    const { result } = await renderHookWithHousehold(() => useShopForm(undefined, onDone));

    act(() => result.current.setName('  '));
    submit(result);

    expect(onDone).not.toHaveBeenCalled();
    expect(await fakeShoppingList.listShops()).toEqual([]);
  });
});
