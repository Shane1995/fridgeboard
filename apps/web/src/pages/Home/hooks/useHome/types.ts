import type { DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import type { UseOverlayStateReturn } from '@heroui/react';
import type {
  Bucket,
  BucketSectionData,
  GroupedItems,
  ListItem,
} from '../../../../services/shoppingList/types';

export type HomeState = {
  title: string;
  grouped: GroupedItems;
  focusedId: string | undefined;
  setFocus: (id: string | undefined) => void;
  visibleSections: BucketSectionData[];
  visibleChecked: ListItem[];
  reorderable: BucketSectionData[];
  unsorted: BucketSectionData | undefined;
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
  allBuckets: Bucket[];
  hasItems: boolean;
  isLoading: boolean;
  hasError: boolean;
  newBucketDialog: UseOverlayStateReturn;
  isClearing: boolean;
  handleClearChecked: () => void;
};
