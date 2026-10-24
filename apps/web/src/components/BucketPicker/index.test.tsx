import { fireEvent, render, screen } from '@testing-library/react';
import { BucketColor } from '../../services/shoppingList/constants';
import type { Bucket } from '../../services/shoppingList/types';
import { BUCKET_PICKER_COPY } from './constants';
import { BucketPicker } from './index';

const BUCKETS: Bucket[] = [
  { id: 'general', name: 'General', color: BucketColor.Slate, order: 0 },
  { id: 'b1', name: 'Express run', color: BucketColor.Mint, order: 1 },
];

const choose = (item: HTMLElement) => {
  fireEvent.keyDown(item, { key: 'Enter' });
  fireEvent.keyUp(item, { key: 'Enter' });
};

describe('BucketPicker', () => {
  it('shows the selected bucket on the trigger', () => {
    render(<BucketPicker buckets={BUCKETS} bucketId="b1" onChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: `${BUCKET_PICKER_COPY.label}: Express run` }),
    ).toBeInTheDocument();
  });

  it('lists every bucket and reports the one chosen', async () => {
    const onChange = vi.fn();
    render(<BucketPicker buckets={BUCKETS} bucketId="b1" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Bucket:/ }));
    const general = await screen.findByRole('menuitemradio', { name: 'General' });
    expect(screen.getByRole('menuitemradio', { name: 'Express run' })).toBeChecked();
    choose(general);

    expect(onChange).toHaveBeenCalledWith('general');
  });
});
