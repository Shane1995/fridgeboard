import { render, screen } from '@testing-library/react';
import { App } from '.';

describe('App', () => {
  it('renders the home screen', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Fridgeboard' })).toBeInTheDocument();
  });
});
