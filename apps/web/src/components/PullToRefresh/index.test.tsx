import { act, fireEvent, render, screen } from '@testing-library/react';
import { PULL_TO_REFRESH_COPY } from './constants';
import { PullToRefresh } from './index';

const touch = (clientY: number) => ({ touches: [{ clientY }] });

describe('PullToRefresh', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('shows nothing until the user pulls', () => {
    render(<PullToRefresh onRefresh={vi.fn()} enabled />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('guides the user from pull to release to refreshing', async () => {
    let finish = () => {};
    const onRefresh = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<PullToRefresh onRefresh={onRefresh} enabled />);

    fireEvent.touchStart(document, touch(0));
    fireEvent.touchMove(document, touch(60));
    expect(await screen.findByRole('status', { name: PULL_TO_REFRESH_COPY.pull })).toBeVisible();

    fireEvent.touchMove(document, touch(200));
    expect(await screen.findByRole('status', { name: PULL_TO_REFRESH_COPY.release })).toBeVisible();

    act(() => {
      fireEvent.touchEnd(document);
    });
    expect(await screen.findByRole('status', { name: PULL_TO_REFRESH_COPY.label })).toBeVisible();

    await act(async () => finish());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows nothing when disabled', () => {
    render(<PullToRefresh onRefresh={vi.fn()} enabled={false} />);

    fireEvent.touchStart(document, touch(0));
    fireEvent.touchMove(document, touch(200));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
