import { fireEvent, render, screen } from '@testing-library/react';
import { BucketColor } from '../../services/shoppingList/constants';
import type { BucketSectionData } from '../../services/shoppingList/types';
import { BUCKET_FILTER_COPY } from './constants';
import { BucketFilter } from './index';

const item = (id: string) => ({ id, name: id, bucketId: 'b1', checked: false, createdAt: 0 });
const SECTIONS: BucketSectionData[] = [
  {
    bucket: { id: 'b1', name: 'Express', color: BucketColor.Mint, order: 0 },
    items: [item('a'), item('b')],
  },
  {
    bucket: { id: 'b2', name: 'Market', color: BucketColor.Mustard, order: 1 },
    items: [item('c')],
  },
];

describe('BucketFilter', () => {
  it('offers All with the total and each bucket with its count', () => {
    render(<BucketFilter sections={SECTIONS} focusedId={undefined} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: `${BUCKET_FILTER_COPY.all}, 3` })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Express, 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Market, 1' })).toBeInTheDocument();
  });

  it('marks the focused bucket as pressed', () => {
    render(<BucketFilter sections={SECTIONS} focusedId="b2" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Market, 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: `${BUCKET_FILTER_COPY.all}, 3` })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('selects a bucket, and All clears the selection', () => {
    const onSelect = vi.fn();
    render(<BucketFilter sections={SECTIONS} focusedId="b1" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Market, 1' }));
    fireEvent.click(screen.getByRole('button', { name: `${BUCKET_FILTER_COPY.all}, 3` }));

    expect(onSelect).toHaveBeenNthCalledWith(1, 'b2');
    expect(onSelect).toHaveBeenNthCalledWith(2, undefined);
  });
});
