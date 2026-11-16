import { render, screen, within } from '@testing-library/react';
import { CalendarView } from '../../constants';
import { CALENDAR_SKELETON_COPY } from './constants';
import { CalendarSkeleton } from '.';

describe('CalendarSkeleton', () => {
  it('is announced as loading to screen readers', () => {
    render(<CalendarSkeleton view={CalendarView.Month} rows={5} />);

    expect(screen.getByRole('status', { name: CALENDAR_SKELETON_COPY.label })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('draws one placeholder per day of the month grid', () => {
    render(<CalendarSkeleton view={CalendarView.Month} rows={5} />);

    const status = screen.getByRole('status');

    expect(within(status).getAllByTestId('skeleton-day')).toHaveLength(35);
  });

  it('draws six weeks when the month needs them', () => {
    render(<CalendarSkeleton view={CalendarView.Month} rows={6} />);

    expect(screen.getAllByTestId('skeleton-day')).toHaveLength(42);
  });

  it('draws a placeholder for the selected day agenda under the month grid', () => {
    render(<CalendarSkeleton view={CalendarView.Month} rows={5} />);

    expect(screen.getAllByTestId('skeleton-agenda-row').length).toBeGreaterThan(0);
  });

  it('draws seven day rows in the week view and no month grid', () => {
    render(<CalendarSkeleton view={CalendarView.Week} rows={5} />);

    expect(screen.getAllByTestId('skeleton-week-day')).toHaveLength(7);
    expect(screen.queryAllByTestId('skeleton-day')).toHaveLength(0);
  });

  it('keeps its placeholders out of the accessibility tree', () => {
    render(<CalendarSkeleton view={CalendarView.Month} rows={5} />);

    expect(
      screen.getAllByTestId('skeleton-day')[0]?.closest('[aria-hidden="true"]'),
    ).not.toBeNull();
  });
});
