import { fireEvent, render, screen } from '@testing-library/react';
import { JOIN_COPY } from '../../constants';
import { InstallHint } from '.';

describe('InstallHint', () => {
  it('shows the Add to Home Screen instructions', () => {
    render(<InstallHint onDismiss={vi.fn()} />);
    expect(screen.getByText(JOIN_COPY.hint)).toBeInTheDocument();
  });

  it('calls onDismiss when the user continues in the browser', () => {
    const onDismiss = vi.fn();
    render(<InstallHint onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: JOIN_COPY.dismiss }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
