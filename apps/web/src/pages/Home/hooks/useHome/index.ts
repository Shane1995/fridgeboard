import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useOverlayState } from '@heroui/react';
import { useState } from 'react';
import { useShopsQuery } from '../../../../hooks/useShopsQuery';
import { useActiveHousehold } from '../../../../hooks/useActiveHousehold';
import { useHouseholdsQuery } from '../../../../hooks/useHouseholdsQuery';
import { useClearCheckedMutation } from '../../../../hooks/useClearCheckedMutation';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { useListCache } from '../../../../hooks/useListCache';
import { useMoveItem } from '../../../../hooks/useMoveItem';
import { useReorderShopsMutation } from '../../../../hooks/useReorderShopsMutation';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import { useItemsQuery } from '../../../../hooks/useItemsQuery';
import {
  FOCUS_SHOP_STORAGE_KEY,
  UNSORTED_SHOP_ID,
} from '../../../../services/shoppingList/constants';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import type { ListItem } from '../../../../services/shoppingList/types';
import {
  groupItemsByShop,
  UNSORTED_SHOP,
} from '../../../../services/shoppingList/utils/groupItemsByShop';
import { inShop } from '../../../../services/shoppingList/utils/inShop';
import { readDraggedItem, readDropShopId } from '../../../../utils/readDragData';
import { HOME_COPY } from '../../constants';
import type { HomeState } from './types';

export const useHome = (): HomeState => {
  const household = useActiveHousehold();
  const households = useHouseholdsQuery();
  const shops = useShopsQuery();
  const items = useItemsQuery();
  const newShopDialog = useOverlayState();
  const clear = useClearCheckedMutation();
  const [storedFocus, setFocus] = useLocalStorage(FOCUS_SHOP_STORAGE_KEY);
  const reorder = useReorderShopsMutation();
  const { updateShops } = useListCache();
  const moveItem = useMoveItem();
  const quickAddFlag = useFeatureFlag(WebFeatureFlag.ENABLE_SHOP_QUICK_ADD);
  const dragFlag = useFeatureFlag(WebFeatureFlag.ENABLE_ITEM_DRAG);
  const [activeItem, setActiveItem] = useState<ListItem | undefined>();
  const [activeShopId, setActiveShopId] = useState<string | undefined>();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const isPending =
    !households.isError && (households.isPending || shops.isPending || items.isPending);
  const [hasSettled, setHasSettled] = useState(false);
  if (!isPending && !hasSettled) {
    setHasSettled(true);
  }

  const shopList = shops.data ?? [];
  const itemList = items.data ?? [];

  const grouped = groupItemsByShop(shopList, itemList);
  const focusedId = [UNSORTED_SHOP, ...shopList].find(({ id }) => id === storedFocus)?.id;
  const visibleSections =
    focusedId === undefined
      ? grouped.sections
      : grouped.sections.filter(({ shop }) => shop.id === focusedId);
  const visibleChecked =
    focusedId === undefined
      ? grouped.checked
      : grouped.checked.filter((item) => inShop({ item, shopId: focusedId, shops: shopList }));

  const allShops = [UNSORTED_SHOP, ...shopList];

  const handleDragStart = ({ active }: DragStartEvent) => {
    const item = readDraggedItem(active.data.current)?.item;
    setActiveItem(item);
    setActiveShopId(item === undefined ? String(active.id) : undefined);
  };

  const handleDragCancel = () => {
    setActiveItem(undefined);
    setActiveShopId(undefined);
  };

  const dropItem = ({ active, over }: DragEndEvent) => {
    const dragged = readDraggedItem(active.data.current);
    const toShopId = readDropShopId(over?.data.current);
    const from = allShops.find(({ id }) => id === dragged?.fromShopId);
    const to = allShops.find(({ id }) => id === toShopId);
    if (dragged !== undefined && from !== undefined && to !== undefined) {
      const latest = itemList.find(({ id }) => id === dragged.item.id) ?? dragged.item;
      moveItem({ item: latest, from, to });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    handleDragCancel();
    if (readDraggedItem(active.data.current) !== undefined) {
      dropItem(event);
      return;
    }
    if (over === null || active.id === over.id) {
      return;
    }
    const ids = shopList.map(({ id }) => id);
    const reordered = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    updateShops({
      update: (current) => reordered.flatMap((id) => current.find((shop) => shop.id === id) ?? []),
    });
    reorder.mutate(reordered);
  };

  return {
    title: household === undefined ? HOME_COPY.title : `${household.name} ${HOME_COPY.title}`,
    grouped,
    focusedId,
    setFocus,
    visibleSections,
    visibleChecked,
    reorderable: grouped.sections.filter(({ shop }) => shop.id !== UNSORTED_SHOP_ID),
    unsorted: grouped.sections.find(({ shop }) => shop.id === UNSORTED_SHOP_ID),
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    activeItem,
    activeShop: grouped.sections.find(({ shop }) => shop.id === activeShopId),
    canDragItems: dragFlag && focusedId === undefined,
    canQuickAdd: quickAddFlag && focusedId === undefined,
    allShops,
    hasItems: itemList.length > 0,
    isLoading: isPending && !hasSettled,
    isEmpty: shops.isSuccess && items.isSuccess && itemList.length === 0,
    hasError: households.isError || shops.isError || items.isError,
    newShopDialog,
    isClearing: clear.isPending,
    handleClearChecked: () => clear.mutate(),
  };
};
