import { render, screen } from '@testing-library/react';
import { ShopSectionSkeleton } from './index';

describe('ShopSectionSkeleton', () => {
  it('draws one placeholder row for each row asked for', () => {
    render(<ShopSectionSkeleton rows={3} />);

    expect(screen.getAllByRole('listitem', { hidden: true })).toHaveLength(3);
  });

  it('draws a different number of rows when asked', () => {
    render(<ShopSectionSkeleton rows={1} />);

    expect(screen.getAllByRole('listitem', { hidden: true })).toHaveLength(1);
  });

  it('has no shop tag unless asked, like the General card', () => {
    const plain = render(<ShopSectionSkeleton rows={1} />).container;
    const tagged = render(<ShopSectionSkeleton rows={1} tagged />).container;

    expect(tagged.querySelectorAll('.skeleton').length).toBe(
      plain.querySelectorAll('.skeleton').length + 1,
    );
  });

  it('is hidden from assistive technology, since the page announces the loading state', () => {
    const { container } = render(<ShopSectionSkeleton rows={2} />);

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('draws nothing readable, so it adds no text to the page', () => {
    const { container } = render(<ShopSectionSkeleton rows={2} />);

    expect(container).toHaveTextContent('');
  });
});
