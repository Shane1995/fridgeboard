import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { UNSORTED_SHOP_NAME } from '../../services/shoppingList/constants';
import { queryClient } from '../../app/queryClient';
import { HOME_COPY } from './constants';
import { Home } from '.';
import { createSession } from '../../testUtils/createSession';
import { TEST_HOUSEHOLD_ID } from '../../testUtils/fakeShoppingList/constants';
import { answerHouseholds } from '../../testUtils/createShoppingListWrapper';
import { TestProviders } from '../../testUtils/TestProviders';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { ShopColor } from '../../services/shoppingList/constants';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { SessionStatus } from '../../services/session/constants';

const fixture = createSession(SessionStatus.SignedIn);
const { apiFetch } = fixture;
const session = fixture.session;

const answerHouseholdsThen = (listAnswer: () => Promise<Response>) =>
  apiFetch.mockImplementation((async (endpoint: { path: string }) => {
    if (endpoint.path.endsWith('/households')) {
      return new Response(
        JSON.stringify({ households: [{ id: TEST_HOUSEHOLD_ID, name: 'Home', role: 'owner' }] }),
        { status: 200 },
      );
    }
    if (endpoint.path.endsWith('/members')) {
      return new Response(JSON.stringify({ members: [] }), { status: 200 });
    }
    return listAnswer();
  }) as never);

const SKELETON_ROWS = 3;

const withDragFlag = (enabled: boolean) => ({
  ...TEST_WEB_CONFIGURATION,
  featureFlags: {
    ...TEST_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_ITEM_DRAG]: enabled,
  },
});

const toggleShop = async (name: string) => {
  fireEvent.click(screen.getByRole('button', { name: /^Assign to shops/ }));
  const item = await screen.findByRole('menuitemcheckbox', { name });
  fireEvent.keyDown(item, { key: 'Enter' });
  fireEvent.keyUp(item, { key: 'Enter' });
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
};

const renderHome = (config = TEST_WEB_CONFIGURATION) => {
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
    <TestProviders session={session} client={queryClient} config={config}>
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
    expect(
      await screen.findByRole('heading', { name: new RegExp(HOME_COPY.title) }),
    ).toBeInTheDocument();
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

  describe('while the list is loading', () => {
    beforeEach(() => {
      answerHouseholdsThen(() => new Promise<Response>(() => {}));
    });

    it('shows a skeleton shaped like the page, labelled for screen readers', async () => {
      renderHome();

      const status = await screen.findByRole('status', { name: HOME_COPY.loading });
      expect(status).toHaveAttribute('aria-busy', 'true');
      expect(within(status).getAllByRole('listitem', { hidden: true })).toHaveLength(SKELETON_ROWS);
    });

    it('holds back the real controls until there is data', async () => {
      renderHome();

      await screen.findByRole('status', { name: HOME_COPY.loading });
      expect(screen.queryByRole('textbox', { name: 'Item' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: HOME_COPY.newShop })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: HOME_COPY.title })).not.toBeInTheDocument();
    });

    it('no longer shows the loading sentence as visible text', async () => {
      renderHome();

      await screen.findByRole('status', { name: HOME_COPY.loading });
      expect(screen.queryByText(HOME_COPY.loading)).not.toBeInTheDocument();
    });

    it('does not claim the list is empty or failed yet', async () => {
      renderHome();

      await screen.findByRole('status', { name: HOME_COPY.loading });
      expect(screen.queryByText(HOME_COPY.empty)).not.toBeInTheDocument();
      expect(screen.queryByText(HOME_COPY.loadFailed)).not.toBeInTheDocument();
    });
  });

  it('swaps the skeleton for the failure message when the households cannot load', async () => {
    apiFetch.mockImplementation((async (endpoint: { path: string }) =>
      endpoint.path.endsWith('/households')
        ? new Response('{}', { status: 500 })
        : new Response('{}', { status: 404 })) as never);
    renderHome();

    expect(
      await screen.findByText(HOME_COPY.loadFailed, undefined, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: HOME_COPY.loading })).not.toBeInTheDocument();
  });

  describe('dragging items between shops', () => {
    const seed = async () => {
      const tesco = await fakeShoppingList.createShop({ name: 'Tesco', color: ShopColor.Sky });
      await fakeShoppingList.addItem({ name: 'Tape', shopIds: [] });
      await fakeShoppingList.addItem({ name: 'Apples', shopIds: [tesco.id] });
      const milk = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
      await fakeShoppingList.updateItem({ id: milk.id, changes: { checked: true } });
    };

    it('puts a grip handle on every item still to get, but not on ticked ones', async () => {
      await seed();
      renderHome(withDragFlag(true));

      expect(await screen.findAllByTestId('item-drag-handle')).toHaveLength(2);
    });

    it('has no grip handles while the flag is off', async () => {
      await seed();
      renderHome(withDragFlag(false));

      await screen.findByRole('checkbox', { name: 'Tape' });
      expect(screen.queryByTestId('item-drag-handle')).not.toBeInTheDocument();
    });

    it('has no grip handles while a single shop is being viewed', async () => {
      await seed();
      renderHome(withDragFlag(true));
      fireEvent.click(await screen.findByRole('button', { name: 'Tesco, 1' }));

      await screen.findByRole('checkbox', { name: 'Apples' });
      expect(screen.queryByTestId('item-drag-handle')).not.toBeInTheDocument();
    });

    it('offers a quick add row for the shop being viewed', async () => {
      await seed();
      renderHome({
        ...TEST_WEB_CONFIGURATION,
        featureFlags: {
          ...TEST_WEB_CONFIGURATION.featureFlags,
          [WebFeatureFlag.ENABLE_SHOP_QUICK_ADD]: true,
        },
      });
      fireEvent.click(await screen.findByRole('button', { name: 'Tesco, 1' }));

      await screen.findByRole('checkbox', { name: 'Apples' });
      expect(screen.getAllByRole('button', { name: 'Add to Tesco' })).toHaveLength(1);
    });

    it('shows an item in a second shop on both cards, with where else it can be got', async () => {
      const tesco = await fakeShoppingList.createShop({ name: 'Tesco', color: ShopColor.Sky });
      const aldi = await fakeShoppingList.createShop({ name: 'Aldi', color: ShopColor.Pink });
      await fakeShoppingList.addItem({ name: 'Apples', shopIds: [tesco.id, aldi.id] });
      renderHome(withDragFlag(true));

      await screen.findByRole('region', { name: 'Tesco' });
      expect(screen.getAllByRole('checkbox', { name: 'Apples' })).toHaveLength(2);
      expect(screen.getByRole('img', { name: 'Also in Aldi' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Also in Tesco' })).toBeInTheDocument();
    });
  });

  it('removes the skeleton once the list has loaded', async () => {
    renderHome();

    expect(await screen.findByText(HOME_COPY.empty)).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: HOME_COPY.loading })).not.toBeInTheDocument();
  });

  it('swaps the skeleton for the failure message when the list cannot load', async () => {
    answerHouseholdsThen(async () => new Response('{}', { status: 500 }));
    renderHome();

    expect(
      await screen.findByText(HOME_COPY.loadFailed, undefined, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: HOME_COPY.loading })).not.toBeInTheDocument();
  });

  it('adds an item, ticks it into got it, then clears it', async () => {
    renderHome();
    fireEvent.change(await screen.findByRole('textbox', { name: 'Item' }), {
      target: { value: 'Milk' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const checkbox = await screen.findByRole('checkbox', { name: 'Milk' });
    expect(screen.getByRole('region', { name: UNSORTED_SHOP_NAME })).toContainElement(checkbox);

    fireEvent.click(checkbox);
    expect(await screen.findByRole('region', { name: HOME_COPY.gotIt })).toContainElement(
      await screen.findByRole('checkbox', { name: 'Milk', checked: true }),
    );

    fireEvent.click(screen.getByRole('button', { name: HOME_COPY.clearTicked }));
    await waitFor(() => expect(screen.queryByText('Milk')).not.toBeInTheDocument());
  });

  it('narrows the list to one shop and back to all', async () => {
    renderHome();
    fireEvent.click(await screen.findByRole('button', { name: HOME_COPY.newShop }));
    fireEvent.change(await screen.findByRole('textbox', { name: 'Name' }), {
      target: { value: 'Express' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create shop' }));
    await screen.findByRole('region', { name: 'Express' });
    await toggleShop('Express');
    fireEvent.change(screen.getByRole('textbox', { name: 'Item' }), { target: { value: 'Milk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await screen.findByRole('checkbox', { name: 'Milk' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Item' }), { target: { value: 'Tape' } });
    await toggleShop('Express');
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await screen.findByRole('checkbox', { name: 'Tape' });

    fireEvent.click(screen.getByRole('button', { name: 'Express, 1' }));

    expect(screen.getByRole('checkbox', { name: 'Milk' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Tape' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^All/ }));

    expect(await screen.findByRole('checkbox', { name: 'Tape' })).toBeInTheDocument();
  });

  it('creates a shop from the dialog', async () => {
    renderHome();
    fireEvent.click(await screen.findByRole('button', { name: HOME_COPY.newShop }));
    fireEvent.change(await screen.findByRole('textbox', { name: 'Name' }), {
      target: { value: 'Express' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create shop' }));
    expect(await screen.findByRole('region', { name: 'Express' })).toBeInTheDocument();
  });
});
