import { render, screen } from '@testing-library/react';
import { App } from '.';

describe('App', () => {
  it('renders the routes', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Fridgeboard' })).toBeInTheDocument();
  });
});
