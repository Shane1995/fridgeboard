import { DndContext } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import { ShopDropZone } from './index';

describe('ShopDropZone', () => {
  it('shows what it wraps', () => {
    render(
      <DndContext>
        <ShopDropZone shopId="b1">
          <p>Tesco card</p>
        </ShopDropZone>
      </DndContext>,
    );

    expect(screen.getByText('Tesco card')).toBeInTheDocument();
  });

  it('is not highlighted until an item is dragged over it', () => {
    const { container } = render(
      <DndContext>
        <ShopDropZone shopId="b1">
          <p>Tesco card</p>
        </ShopDropZone>
      </DndContext>,
    );

    expect(container.firstElementChild).not.toHaveClass('ring-2');
  });
});
