import { fireEvent, render, screen } from '@testing-library/react';
import { CONFIGURATION_ERROR_COPY } from './constants';
import { ConfigurationError } from '.';

describe('ConfigurationError', () => {
  it('announces the failure', () => {
    render(<ConfigurationError onRetry={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(CONFIGURATION_ERROR_COPY.title);
  });

  it('retries when the button is pressed', () => {
    const onRetry = vi.fn();
    render(<ConfigurationError onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: CONFIGURATION_ERROR_COPY.retry }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
