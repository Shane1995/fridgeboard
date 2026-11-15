import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { AddItemForm } from '../../components/AddItemForm';
import { ShopDialog } from '../../components/ShopDialog';
import { ShopFilter } from '../../components/ShopFilter';
import { ShopCard } from '../../components/ShopCard';
import { ShopSection } from '../../components/ShopSection';
import { ItemDragPreview } from '../../components/ItemDragPreview';
import { ShopDragPreview } from '../../components/ShopDragPreview';
import { detectShopCollisions } from '../../utils/detectShopCollisions';
import { restrictShopDragToVerticalAxis } from '../../utils/restrictShopDragToVerticalAxis';
import { SortableShop } from '../../components/SortableShop';
import { PullToRefresh } from '../../components/PullToRefresh';
import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { HomeSkeleton } from './components/HomeSkeleton';
import { HOME_COPY } from './constants';
import { useHome } from './hooks/useHome';

export const Home = () => {
  const {
    title,
    grouped,
    focusedId,
    setFocus,
    visibleSections,
    reorderable,
    unsorted,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    activeItem,
    activeShop,
    canDragItems,
    canQuickAdd,
    canPullToRefresh,
    refresh,
    allShops,
    isEmpty,
    isLoading,
    hasError,
    newShopDialog,
    isClearing,
    handleClearChecked,
    handleClearAll,
    hasItems,
  } = useHome();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-7 p-6">
      <PullToRefresh onRefresh={refresh} enabled={canPullToRefresh} />
      <PageHeader title={title} />
      <AddItemForm focusedShopId={focusedId} />
      {grouped.sections.length > 0 && (
        <ShopFilter sections={grouped.sections} focusedId={focusedId} onSelect={setFocus} />
      )}
      {hasError && <Typography>{HOME_COPY.loadFailed}</Typography>}
      {isEmpty && <Typography>{HOME_COPY.empty}</Typography>}
      {focusedId === undefined ? (
        <DndContext
          sensors={sensors}
          collisionDetection={detectShopCollisions}
          modifiers={[restrictShopDragToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {unsorted && (
            <ShopCard
              section={unsorted}
              allShops={allShops}
              draggable={canDragItems}
              quickAdd={canQuickAdd}
            />
          )}
          <SortableContext
            items={reorderable.map(({ shop }) => shop.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-7">
              {reorderable.map((section) => (
                <SortableShop key={section.shop.id} id={section.shop.id} name={section.shop.name}>
                  <ShopCard
                    section={section}
                    allShops={allShops}
                    draggable={canDragItems}
                    quickAdd={canQuickAdd}
                  />
                </SortableShop>
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeItem && <ItemDragPreview item={activeItem} />}
            {activeShop && <ShopDragPreview section={activeShop} />}
          </DragOverlay>
        </DndContext>
      ) : (
        <>
          {visibleSections.map((section) => (
            <ShopSection
              key={section.shop.id}
              section={section}
              allShops={allShops}
              quickAdd={canQuickAdd}
            />
          ))}
          {visibleSections.length === 0 && <Typography>{HOME_COPY.focusEmpty}</Typography>}
        </>
      )}
      {focusedId === undefined && grouped.tickedCount > 0 && (
        <Button
          size="sm"
          variant="secondary"
          onPress={handleClearChecked}
          isPending={isClearing}
          className="self-end"
        >
          {HOME_COPY.clearTicked}
        </Button>
      )}
      {focusedId === undefined && (
        <button
          type="button"
          onClick={newShopDialog.open}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground/15 px-4 py-3 text-sm font-medium opacity-60 transition-opacity hover:opacity-100"
        >
          <Plus aria-hidden size={18} />
          {HOME_COPY.newShop}
        </button>
      )}
      {focusedId === undefined && hasItems && (
        <Button size="sm" variant="ghost" onPress={handleClearAll} isPending={isClearing}>
          {HOME_COPY.clearAll}
        </Button>
      )}
      <ShopDialog state={newShopDialog} />
    </main>
  );
};
