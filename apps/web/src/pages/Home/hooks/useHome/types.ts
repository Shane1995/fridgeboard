import type { DragEndEvent, DragStartEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import type { UseOverlayStateReturn } from '@heroui/react';
import type {
  Shop,
  ShopSectionData,
  GroupedItems,
  ListItem,
} from '../../../../services/shoppingList/types';

export type HomeState = {
  title: string;
  grouped: GroupedItems;
  focusedId: string | undefined;
  setFocus: (id: string | undefined) => void;
  visibleSections: ShopSectionData[];
  visibleChecked: ListItem[];
  reorderable: ShopSectionData[];
  unsorted: ShopSectionData | undefined;
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
  activeItem: ListItem | undefined;
  activeShop: ShopSectionData | undefined;
  canDragItems: boolean;
  canQuickAdd: boolean;
  canPullToRefresh: boolean;
  refresh: () => Promise<unknown>;
  allShops: Shop[];
  hasItems: boolean;
  isLoading: boolean;
  isEmpty: boolean;
  hasError: boolean;
  newShopDialog: UseOverlayStateReturn;
  isClearing: boolean;
  handleClearChecked: () => void;
};
