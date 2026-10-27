import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { RecipeBookProvider } from '../../Context/RecipeBook';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { Recipes } from './index';
import { RECIPES_COPY } from './constants';

const { session } = createSession(SessionStatus.SignedIn);

const renderRecipes = async ({ enabled }: { enabled: boolean }) => {
  const config = {
    ...TEST_WEB_CONFIGURATION,
    featureFlags: {
      ...TEST_WEB_CONFIGURATION.featureFlags,
      [WebFeatureFlag.ENABLE_RECIPES]: enabled,
    },
  };
  const rootRoute = createRootRoute();
  const page = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
      <TestProviders session={session} config={config}>
        <RecipeBookProvider>
          <Recipes />
        </RecipeBookProvider>
      </TestProviders>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([page]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
  await screen.findByRole('main');
};

const openRecipe = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name: `${RECIPES_COPY.open} ${name}` }));

describe('Recipes', () => {
  it('shows the placeholder while the flag is off', async () => {
    await renderRecipes({ enabled: false });
    expect(screen.getByText(RECIPES_COPY.placeholder)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: RECIPES_COPY.newRecipe })).not.toBeInTheDocument();
  });

  it('lists recipes with favourites first and filters by search and tag', async () => {
    await renderRecipes({ enabled: true });
    const [first] = screen.getAllByRole('listitem');
    expect(first).toHaveTextContent('Spaghetti bolognese');

    fireEvent.change(screen.getByRole('searchbox', { name: RECIPES_COPY.searchLabel }), {
      target: { value: 'kidney' },
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Veggie chilli')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox', { name: RECIPES_COPY.searchLabel }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'dessert' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Chocolate brownies')).toBeInTheDocument();
  });

  it('opens a recipe, shows its ingredients and goes back', async () => {
    await renderRecipes({ enabled: true });
    openRecipe('Butternut squash soup');
    expect(screen.getByRole('heading', { name: 'Butternut squash soup' })).toBeInTheDocument();
    expect(screen.getByText('750 ml vegetable stock')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: RECIPES_COPY.back }));
    expect(screen.getByRole('searchbox', { name: RECIPES_COPY.searchLabel })).toBeInTheDocument();
  });

  it('favourites a recipe from its card', async () => {
    await renderRecipes({ enabled: true });
    const card = screen.getByText('Veggie chilli').closest('li') as HTMLElement;
    fireEvent.click(within(card).getByRole('button', { name: RECIPES_COPY.favouriteOff }));
    expect(
      within(card).getByRole('button', { name: RECIPES_COPY.favouriteOn }),
    ).toBeInTheDocument();
  });

  it('creates a recipe by hand', async () => {
    await renderRecipes({ enabled: true });
    fireEvent.click(screen.getByRole('button', { name: RECIPES_COPY.newRecipe }));
    fireEvent.change(screen.getByRole('textbox', { name: /^Name/ }), {
      target: { value: 'Pancakes' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Ingredient' }), {
      target: { value: 'flour' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save recipe' }));
    expect(await screen.findByRole('heading', { name: 'Pancakes' })).toBeInTheDocument();
  });

  it('edits a recipe', async () => {
    await renderRecipes({ enabled: true });
    openRecipe('Chicken tikka traybake');
    fireEvent.click(screen.getByRole('button', { name: RECIPES_COPY.edit }));
    fireEvent.change(screen.getByRole('textbox', { name: /^Name/ }), {
      target: { value: 'Tikka traybake' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save recipe' }));
    expect(await screen.findByRole('heading', { name: 'Tikka traybake' })).toBeInTheDocument();
  });

  it('deletes a recipe after a confirm', async () => {
    await renderRecipes({ enabled: true });
    openRecipe('Chocolate brownies');
    fireEvent.click(screen.getByRole('button', { name: RECIPES_COPY.delete }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: RECIPES_COPY.confirmDelete }));
    expect(
      await screen.findByRole('searchbox', { name: RECIPES_COPY.searchLabel }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Chocolate brownies')).not.toBeInTheDocument();
  });
});
