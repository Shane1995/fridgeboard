import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { AddItemForm } from '../../components/AddItemForm';
import { BucketDialog } from '../../components/BucketDialog';
import { BucketFilter } from '../../components/BucketFilter';
import { BucketSection } from '../../components/BucketSection';
import { ItemRow } from '../../components/ItemRow';
import { restrictToVerticalAxis } from '../../utils/restrictToVerticalAxis';
import { SortableBucket } from '../../components/SortableBucket';
import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';
import { HOME_COPY } from './constants';
import { useHome } from './hooks/useHome';

export const Home = () => {
  const {
    grouped,
    focusedId,
    setFocus,
    visibleSections,
    visibleChecked,
    reorderable,
    unsorted,
    sensors,
    handleDragEnd,
    allBuckets,
    hasItems,
    isLoading,
    hasError,
    newBucketDialog,
    isClearing,
    handleClearChecked,
  } = useHome();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-7 p-6">
      <PageHeader title={HOME_COPY.title} />
      <AddItemForm focusedBucketId={focusedId} />
      {grouped.sections.length > 0 && (
        <BucketFilter sections={grouped.sections} focusedId={focusedId} onSelect={setFocus} />
      )}
      {isLoading && <Typography>{HOME_COPY.loading}</Typography>}
      {hasError && <Typography>{HOME_COPY.loadFailed}</Typography>}
      {!isLoading && !hasError && !hasItems && <Typography>{HOME_COPY.empty}</Typography>}
      {focusedId === undefined ? (
        <>
          {unsorted && <BucketSection section={unsorted} allBuckets={allBuckets} />}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={reorderable.map(({ bucket }) => bucket.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-7">
                {reorderable.map((section) => (
                  <SortableBucket
                    key={section.bucket.id}
                    id={section.bucket.id}
                    name={section.bucket.name}
                  >
                    <BucketSection section={section} allBuckets={allBuckets} />
                  </SortableBucket>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      ) : (
        <>
          {visibleSections.map((section) => (
            <BucketSection key={section.bucket.id} section={section} allBuckets={allBuckets} />
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
              <ItemRow key={item.id} item={item} moveTargets={allBuckets} />
            ))}
          </ul>
        </section>
      )}
      {focusedId === undefined && (
        <button
          type="button"
          onClick={newBucketDialog.open}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground/15 px-4 py-3 text-sm font-medium opacity-60 transition-opacity hover:opacity-100"
        >
          <Plus aria-hidden size={18} />
          {HOME_COPY.newBucket}
        </button>
      )}
      <BucketDialog state={newBucketDialog} />
    </main>
  );
};
