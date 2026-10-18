import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { routeTree } from '../../routeTree.gen';
import { queryClient } from '../queryClient';

function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
}

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
