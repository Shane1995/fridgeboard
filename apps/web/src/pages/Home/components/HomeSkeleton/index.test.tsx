import { render, screen, within } from '@testing-library/react';
import { HOME_COPY } from '../../constants';
import { HomeSkeleton } from './index';

describe('HomeSkeleton', () => {
  it('announces the loading state once, as a busy status', () => {
    render(<HomeSkeleton />);

    const status = screen.getByRole('status', { name: HOME_COPY.loading });
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps the page landmark so the layout does not change when data arrives', () => {
    render(<HomeSkeleton />);

    expect(screen.getByRole('main')).toContainElement(screen.getByRole('status'));
  });

  it('draws the card rows and the got-it row, all hidden from assistive technology', () => {
    render(<HomeSkeleton />);

    const status = screen.getByRole('status');
    expect(within(status).queryAllByRole('listitem')).toHaveLength(0);
    expect(within(status).getAllByRole('listitem', { hidden: true })).toHaveLength(3);
  });

  it('shows no readable text and no controls', () => {
    render(<HomeSkeleton />);

    expect(screen.getByRole('main')).toHaveTextContent('');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
