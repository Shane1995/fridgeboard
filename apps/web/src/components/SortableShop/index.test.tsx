import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { render, screen } from '@testing-library/react';
import { SORTABLE_SHOP_COPY } from './constants';
import { SortableShop } from './index';

describe('SortableShop', () => {
  it('shows its content with a labelled drag handle', () => {
    render(
      <DndContext>
        <SortableContext items={['b1']}>
          <SortableShop id="b1" name="Express">
            <p>content</p>
          </SortableShop>
        </SortableContext>
      </DndContext>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `${SORTABLE_SHOP_COPY.handle}: Express` }),
    ).toBeInTheDocument();
  });
});
