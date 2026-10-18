import { render, screen } from '@testing-library/react';
import { Home } from '.';
import { HOME_COPY } from './constants';

describe('Home', () => {
  it('shows the app name as the heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: HOME_COPY.title })).toBeInTheDocument();
  });

  it('shows a disabled add item button', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: HOME_COPY.addItem })).toBeDisabled();
  });
});
