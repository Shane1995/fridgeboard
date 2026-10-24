import { render } from '@testing-library/react';
import { BucketColor } from '../../services/shoppingList/constants';
import { BUCKET_COLOR_CLASSES } from './constants';
import { BucketSwatch } from './index';

describe('BucketSwatch', () => {
  it.each(Object.values(BucketColor))('paints the %s magnet', (color) => {
    const { container } = render(<BucketSwatch color={color} />);

    expect(container.firstElementChild).toHaveClass(BUCKET_COLOR_CLASSES[color]);
  });
});
