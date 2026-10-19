import { render, screen } from '@testing-library/react';
import { APP_LOADER_COPY } from './constants';
import { AppLoader } from '.';

describe('AppLoader', () => {
  it('renders a status region with the accessible label', () => {
    render(<AppLoader />);
    expect(screen.getByRole('status', { name: APP_LOADER_COPY.label })).toBeInTheDocument();
  });
});
