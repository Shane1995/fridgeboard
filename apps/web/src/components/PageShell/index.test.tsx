import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, within } from '@testing-library/react';
import { PageShell } from '.';

const renderShell = async () => {
  const rootRoute = createRootRoute({
    component: () => (
      <PageShell title="Chop list">
        <p>Page content</p>
      </PageShell>
    ),
  });
  const home = createRoute({ getParentRoute: () => rootRoute, path: '/' });
  const router = createRouter({
    routeTree: rootRoute.addChildren([home]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
  await screen.findByRole('heading', { name: 'Chop list' });
};

describe('PageShell', () => {
  it('puts the page title and the content inside one main landmark', async () => {
    await renderShell();

    const main = screen.getByRole('main');

    expect(within(main).getByRole('heading', { name: 'Chop list', level: 1 })).toBeInTheDocument();
    expect(within(main).getByText('Page content')).toBeInTheDocument();
  });

  it('shows the title before the content', async () => {
    await renderShell();

    const heading = screen.getByRole('heading', { name: 'Chop list' });
    const content = screen.getByText('Page content');

    expect(
      heading.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('gives every page the same width and padding', async () => {
    await renderShell();

    expect(screen.getByRole('main')).toHaveClass('mx-auto', 'max-w-2xl', 'p-4', 'md:p-6');
  });
});
