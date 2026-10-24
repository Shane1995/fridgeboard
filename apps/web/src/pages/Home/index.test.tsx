import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_NAME } from '../../services/shoppingList/constants';
import { queryClient } from '../../app/queryClient';
import { HOME_COPY } from './constants';
import { Home } from '.';
import { createSession } from '../../testUtils/createSession';
import { answerHouseholds } from '../../testUtils/createShoppingListWrapper';
import { TestProviders } from '../../testUtils/TestProviders';
import { SessionStatus } from '../../services/session/constants';

const fixture = createSession(SessionStatus.SignedIn);
const { apiFetch } = fixture;
const session = fixture.session;

const pickBucket = async (name: string) => {
  fireEvent.click(screen.getByRole('button', { name: /^Bucket:/ }));
  const item = await screen.findByRole('menuitemradio', { name });
  fireEvent.keyDown(item, { key: 'Enter' });
  fireEvent.keyUp(item, { key: 'Enter' });
};

const renderHome = () => {
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <p>sign in page</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, signInRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <TestProviders session={session} client={queryClient}>
      <RouterProvider router={router} />
    </TestProviders>,
  );
};

describe('Home', () => {
  beforeEach(() => {
    window.localStorage.clear();
    queryClient.clear();
    vi.resetAllMocks();
    answerHouseholds(apiFetch);
  });

  it('shows the page title as the heading', async () => {
    renderHome();
    expect(await screen.findByRole('heading', { name: HOME_COPY.title })).toBeInTheDocument();
  });

  it('puts the household name in the title', async () => {
    renderHome();
    expect(
      await screen.findByRole('heading', { name: `Home ${HOME_COPY.title}` }),
    ).toBeInTheDocument();
  });

  it('says the list is empty', async () => {
    renderHome();
    expect(await screen.findByText(HOME_COPY.empty)).toBeInTheDocument();
  });

  it('adds an item, ticks it into got it, then clears it', async () => {
    renderHome();
    fireEvent.change(await screen.findByRole('textbox', { name: 'Item' }), {
      target: { value: 'Milk' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const checkbox = await screen.findByRole('checkbox', { name: 'Milk' });
    expect(screen.getByRole('region', { name: UNSORTED_BUCKET_NAME })).toContainElement(checkbox);

    fireEvent.click(checkbox);
    expect(await screen.findByRole('region', { name: HOME_COPY.gotIt })).toContainElement(
      await screen.findByRole('checkbox', { name: 'Milk', checked: true }),
    );

    fireEvent.click(screen.getByRole('button', { name: HOME_COPY.clearTicked }));
    await waitFor(() => expect(screen.queryByText('Milk')).not.toBeInTheDocument());
  });

  it('narrows the list to one bucket and back to all', async () => {
    renderHome();
    fireEvent.click(await screen.findByRole('button', { name: HOME_COPY.newBucket }));
    fireEvent.change(await screen.findByRole('textbox', { name: 'Name' }), {
      target: { value: 'Express' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create bucket' }));
    await screen.findByRole('region', { name: 'Express' });
    await pickBucket('Express');
    fireEvent.change(screen.getByRole('textbox', { name: 'Item' }), { target: { value: 'Milk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await screen.findByRole('checkbox', { name: 'Milk' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Item' }), { target: { value: 'Tape' } });
    await pickBucket(UNSORTED_BUCKET_NAME);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await screen.findByRole('checkbox', { name: 'Tape' });

    fireEvent.click(screen.getByRole('button', { name: 'Express, 1' }));

    expect(screen.getByRole('checkbox', { name: 'Milk' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Tape' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^All/ }));

    expect(await screen.findByRole('checkbox', { name: 'Tape' })).toBeInTheDocument();
  });

  it('creates a bucket from the dialog', async () => {
    renderHome();
    fireEvent.click(await screen.findByRole('button', { name: HOME_COPY.newBucket }));
    fireEvent.change(await screen.findByRole('textbox', { name: 'Name' }), {
      target: { value: 'Express' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create bucket' }));
    expect(await screen.findByRole('region', { name: 'Express' })).toBeInTheDocument();
  });
});
