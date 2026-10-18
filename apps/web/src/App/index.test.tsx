import { render, screen } from '@testing-library/react';
import { App } from '.';

describe('App', () => {
  it('renders the routes', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Fridgeboard' })).toBeInTheDocument();
  });
});
