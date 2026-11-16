import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
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
import { PageShell } from '../../components/PageShell';
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
    tickedCount,
    clearTickedDialog,
    clearAllDialog,
    clearTickedCount,
    openClearTicked,
    confirmClearTicked,
    confirmClearAll,
    hasItems,
  } = useHome();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <PageShell title={title}>
      <PullToRefresh onRefresh={refresh} enabled={canPullToRefresh} />
      <div className="flex flex-col gap-7">
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
        {focusedId === undefined && tickedCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            onPress={openClearTicked}
            isPending={isClearing}
            className="self-end"
          >
            {HOME_COPY.clearTicked} ({tickedCount})
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
          <button
            type="button"
            onClick={clearAllDialog.open}
            disabled={isClearing}
            className="mt-10 cursor-pointer self-center text-xs text-foreground/50 underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus"
          >
            {HOME_COPY.clearAll}
          </button>
        )}
        <ShopDialog state={newShopDialog} />
        <ConfirmDialog
          state={clearTickedDialog}
          title={HOME_COPY.clearTickedTitle(clearTickedCount)}
          description={HOME_COPY.clearTickedDescription}
          confirmLabel={HOME_COPY.clearTickedConfirm}
          onConfirm={confirmClearTicked}
        />
        <ConfirmDialog
          state={clearAllDialog}
          title={HOME_COPY.clearAllTitle}
          description={HOME_COPY.clearAllDescription}
          confirmLabel={HOME_COPY.clearAllConfirm}
          onConfirm={confirmClearAll}
          holdToConfirm
        />
      </div>
    </PageShell>
  );
};
