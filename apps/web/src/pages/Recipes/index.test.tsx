import { act, fireEvent, screen, within } from '@testing-library/react';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { renderInRouter } from '../../testUtils/renderInRouter';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { Recipes } from './index';
import { MOCK_PARSE_DELAY_MS } from '../../Context/RecipeBook/constants';
import { ADD_TO_LIST_COPY } from './components/AddToListDialog/constants';
import { IDEAS_DIALOG_COPY } from './components/IdeasDialog/constants';
import { IMPORT_DIALOG_COPY } from './components/ImportDialog/constants';
import { IMPORTS_TRAY_COPY } from './components/ImportsTray/constants';
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
  await renderInRouter(
    <TestProviders session={session} config={config}>
      <Recipes />
    </TestProviders>,
  );
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

  describe('adding to the Chop list', () => {
    const openAddToList = async (name: string) => {
      openRecipe(name);
      fireEvent.click(screen.getByRole('button', { name: RECIPES_COPY.addToList }));
      return screen.findByRole('dialog');
    };

    it('ticks what is needed, flags what is already on the list and scales servings', async () => {
      await renderRecipes({ enabled: true });
      const dialog = await openAddToList('Spaghetti bolognese');
      expect(within(dialog).getByRole('checkbox', { name: 'Add 500 g beef mince' })).toBeChecked();
      expect(
        within(dialog).getByRole('checkbox', { name: 'Add 2 tbsp olive oil' }),
      ).not.toBeChecked();
      expect(within(dialog).getByRole('checkbox', { name: 'Add 2 onions' })).toBeDisabled();
      expect(within(dialog).getByText(ADD_TO_LIST_COPY.onList)).toBeInTheDocument();

      fireEvent.click(within(dialog).getByRole('button', { name: ADD_TO_LIST_COPY.more }));
      expect(within(dialog).getByRole('checkbox', { name: 'Add 625 g beef mince' })).toBeChecked();
      expect(
        within(dialog).getByRole('button', { name: ADD_TO_LIST_COPY.submit(4) }),
      ).toBeEnabled();
    });

    it('swaps a suggested shop with one tap', async () => {
      await renderRecipes({ enabled: true });
      const dialog = await openAddToList('Spaghetti bolognese');
      const shops = within(dialog).getByRole('group', { name: 'Shops for beef mince' });
      expect(within(shops).getByRole('button', { name: "Sainsbury's order" })).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      fireEvent.click(
        within(dialog).getAllByRole('button', { name: `${ADD_TO_LIST_COPY.swapTo} Express` })[0] ??
          dialog,
      );
      expect(within(shops).getByRole('button', { name: 'Express' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(within(shops).getByRole('button', { name: "Sainsbury's order" })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    it('adds the ticked items and closes', async () => {
      await renderRecipes({ enabled: true });
      const dialog = await openAddToList('Spaghetti bolognese');
      fireEvent.click(within(dialog).getByRole('button', { name: ADD_TO_LIST_COPY.submit(4) }));
      expect(await screen.findByText(ADD_TO_LIST_COPY.added(4))).toBeInTheDocument();
    });
  });

  describe('importing', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    const finishParsing = () =>
      act(async () => {
        await vi.advanceTimersByTimeAsync(MOCK_PARSE_DELAY_MS);
      });

    const importSource = async (source: string) => {
      fireEvent.click(screen.getByRole('button', { name: RECIPES_COPY.importRecipe }));
      const dialog = await screen.findByRole('dialog');
      fireEvent.change(within(dialog).getByRole('textbox', { name: IMPORT_DIALOG_COPY.label }), {
        target: { value: source },
      });
      fireEvent.click(within(dialog).getByRole('button', { name: IMPORT_DIALOG_COPY.submit }));
    };

    it('imports a link, reviews the draft and saves it as a recipe', async () => {
      await renderRecipes({ enabled: true });
      await importSource('https://example.com/recipes/pesto-pasta');
      expect(
        await screen.findByText(`${IMPORTS_TRAY_COPY.parsing} example.com`),
      ).toBeInTheDocument();

      await finishParsing();
      const tray = screen.getByRole('region', { name: IMPORTS_TRAY_COPY.heading });
      expect(
        within(tray).getByText(`${IMPORTS_TRAY_COPY.imported} Pesto Pasta`),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: IMPORTS_TRAY_COPY.review }));
      expect(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue('Pesto Pasta');
      fireEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

      expect(await screen.findByRole('heading', { name: 'Pesto Pasta' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: RECIPES_COPY.back }));
      expect(
        screen.queryByRole('region', { name: IMPORTS_TRAY_COPY.heading }),
      ).not.toBeInTheDocument();
    });

    it('shows a failed import with a reason, and lets you retry and discard it', async () => {
      await renderRecipes({ enabled: true });
      await importSource('https://example.com/fail');
      await finishParsing();
      expect(screen.getByRole('button', { name: IMPORTS_TRAY_COPY.retry })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: IMPORTS_TRAY_COPY.retry }));
      expect(screen.getByText(`${IMPORTS_TRAY_COPY.parsing} example.com`)).toBeInTheDocument();
      await finishParsing();

      fireEvent.click(screen.getByRole('button', { name: IMPORTS_TRAY_COPY.discard }));
      expect(
        screen.queryByRole('region', { name: IMPORTS_TRAY_COPY.heading }),
      ).not.toBeInTheDocument();
    });

    it('rejects a plain http link', async () => {
      await renderRecipes({ enabled: true });
      await importSource('http://example.com/x');
      expect(await screen.findByText(IMPORT_DIALOG_COPY.httpsOnly)).toBeInTheDocument();
      expect(
        screen.queryByRole('region', { name: IMPORTS_TRAY_COPY.heading }),
      ).not.toBeInTheDocument();
    });

    it('imports the ideas you tick', async () => {
      await renderRecipes({ enabled: true });
      fireEvent.click(screen.getByRole('button', { name: RECIPES_COPY.findIdeas }));
      const dialog = await screen.findByRole('dialog');
      fireEvent.change(within(dialog).getByRole('textbox', { name: IDEAS_DIALOG_COPY.label }), {
        target: { value: 'a chocolate dessert on Wednesday' },
      });
      fireEvent.click(within(dialog).getByRole('button', { name: IDEAS_DIALOG_COPY.search }));
      const results = within(dialog).getByRole('list', { name: IDEAS_DIALOG_COPY.resultsLabel });
      const boxes = within(results).getAllByRole('checkbox');
      expect(boxes).toHaveLength(5);
      fireEvent.click(boxes[0] ?? results);
      fireEvent.click(boxes[1] ?? results);
      fireEvent.click(
        within(dialog).getByRole('button', { name: `${IDEAS_DIALOG_COPY.importSelected} (2)` }),
      );

      await finishParsing();
      expect(screen.getAllByRole('button', { name: IMPORTS_TRAY_COPY.review })).toHaveLength(2);
    });
  });
});
