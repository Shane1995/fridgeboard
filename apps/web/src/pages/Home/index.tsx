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
import { ItemRow } from '../../components/ItemRow';
import { detectShopCollisions } from '../../utils/detectShopCollisions';
import { restrictShopDragToVerticalAxis } from '../../utils/restrictShopDragToVerticalAxis';
import { SortableShop } from '../../components/SortableShop';
import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';
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
    visibleChecked,
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
    allShops,
    isEmpty,
    isLoading,
    hasError,
    newShopDialog,
    isClearing,
    handleClearChecked,
  } = useHome();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-7 p-6">
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
            {activeItem && <ItemDragPreview item={activeItem} shops={allShops} />}
            {activeShop && <ShopDragPreview section={activeShop} />}
          </DragOverlay>
        </DndContext>
      ) : (
        <>
          {visibleSections.map((section) => (
            <ShopSection key={section.shop.id} section={section} allShops={allShops} />
          ))}
          {visibleSections.length === 0 && visibleChecked.length === 0 && (
            <Typography>{HOME_COPY.focusEmpty}</Typography>
          )}
        </>
      )}
      {visibleChecked.length > 0 && (
        <section aria-label={HOME_COPY.gotIt} className="flex flex-col gap-2">
          <header className="flex items-center justify-between">
            <Typography variant={TypographyVariant.Heading3} as="h2">
              {HOME_COPY.gotIt}
            </Typography>
            {focusedId === undefined && (
              <Button
                size="sm"
                variant="secondary"
                onPress={handleClearChecked}
                isPending={isClearing}
              >
                {HOME_COPY.clearTicked}
              </Button>
            )}
          </header>
          <ul className="flex flex-col gap-2">
            {visibleChecked.map((item) => (
              <ItemRow key={item.id} item={item} shops={allShops} />
            ))}
          </ul>
        </section>
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
      <ShopDialog state={newShopDialog} />
    </main>
  );
};
