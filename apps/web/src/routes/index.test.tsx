import { render, screen } from '@testing-library/react';
import { Routes } from '.';

describe('Routes', () => {
  it('renders the home page', () => {
    render(<Routes />);
    expect(screen.getByRole('heading', { name: 'Fridgeboard' })).toBeInTheDocument();
  });
});
