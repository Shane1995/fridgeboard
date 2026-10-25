import type { DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
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
  handleDragEnd: (event: DragEndEvent) => void;
  allShops: Shop[];
  hasItems: boolean;
  isLoading: boolean;
  isEmpty: boolean;
  hasError: boolean;
  newShopDialog: UseOverlayStateReturn;
  isClearing: boolean;
  handleClearChecked: () => void;
};
