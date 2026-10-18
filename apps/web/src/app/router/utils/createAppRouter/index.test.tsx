import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { createAppRouter } from './index';

const renderAt = (path: string) => {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  render(<RouterProvider router={router} />);
};

describe('router', () => {
  it('renders the home page at /', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Fridgeboard' })).toBeInTheDocument();
  });

  it('renders the not-found component for an unknown path', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
