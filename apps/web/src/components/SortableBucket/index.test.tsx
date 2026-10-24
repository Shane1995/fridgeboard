import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { render, screen } from '@testing-library/react';
import { SORTABLE_BUCKET_COPY } from './constants';
import { SortableBucket } from './index';

describe('SortableBucket', () => {
  it('shows its content with a labelled drag handle', () => {
    render(
      <DndContext>
        <SortableContext items={['b1']}>
          <SortableBucket id="b1" name="Express">
            <p>content</p>
          </SortableBucket>
        </SortableContext>
      </DndContext>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `${SORTABLE_BUCKET_COPY.handle}: Express` }),
    ).toBeInTheDocument();
  });
});
