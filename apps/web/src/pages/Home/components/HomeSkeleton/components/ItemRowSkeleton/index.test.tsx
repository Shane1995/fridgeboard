import { render } from '@testing-library/react';
import { ItemRowSkeleton } from './index';

const renderRow = (index: number) =>
  render(
    <ul>
      <ItemRowSkeleton index={index} />
    </ul>,
  );

describe('ItemRowSkeleton', () => {
  it('draws a checkbox, a name and a menu placeholder', () => {
    const { container } = renderRow(0);

    expect(container.querySelectorAll('.skeleton')).toHaveLength(3);
  });

  it('gives neighbouring rows different name widths', () => {
    const widths = [0, 1, 2, 3].map((index) => {
      const { container, unmount } = renderRow(index);
      const name = container.querySelectorAll('.skeleton')[1];
      unmount();
      return name?.className.match(/w-\d\/\d/)?.[0];
    });

    expect(new Set(widths).size).toBe(4);
  });

  it('starts the cycle again after the last width', () => {
    const first = renderRow(0).container.querySelectorAll('.skeleton')[1]?.className;
    const again = renderRow(4).container.querySelectorAll('.skeleton')[1]?.className;

    expect(again).toBe(first);
  });

  it('draws nothing readable', () => {
    const { container } = renderRow(0);

    expect(container).toHaveTextContent('');
  });
});
