import { fireEvent, screen, within } from '@testing-library/react';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { renderInRouter } from '../../testUtils/renderInRouter';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { PLANNER_COPY } from './components/Planner/constants';
import { Meals } from './index';
import { MEALS_COPY } from './constants';
import { formatWeekdayName } from '../Calendar/utils/formatWeekdayName';

const { session } = createSession(SessionStatus.SignedIn);

const renderMeals = async (enabled: boolean) => {
  const config = {
    ...TEST_WEB_CONFIGURATION,
    featureFlags: {
      ...TEST_WEB_CONFIGURATION.featureFlags,
      [WebFeatureFlag.ENABLE_CALENDAR]: enabled,
    },
  };
  await renderInRouter(
    <TestProviders session={session} config={config}>
      <Meals />
    </TestProviders>,
  );
};

describe('Meals', () => {
  it('shows the placeholder while the flag is off', async () => {
    await renderMeals(false);
    expect(screen.getByRole('heading', { name: MEALS_COPY.title })).toBeInTheDocument();
    expect(screen.getByText(MEALS_COPY.placeholder)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Sunday' })).not.toBeInTheDocument();
  });

  it('shows a date-free planner and edits a meal line', async () => {
    await renderMeals(true);
    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));
    const input = within(sunday).getAllByRole('textbox').at(-1);
    expect(input).toBeDefined();
    if (input !== undefined) {
      fireEvent.change(input, { target: { value: 'Pancakes' } });
    }
    expect(within(sunday).getByDisplayValue('Pancakes')).toBeInTheDocument();
  });

  it('adds a recipe to a day as a linked line and opens it from the line', async () => {
    await renderMeals(true);
    const tuesday = screen.getByRole('region', { name: 'Tuesday' });
    fireEvent.click(
      within(tuesday).getByRole('button', { name: `${PLANNER_COPY.addRecipe} Tuesday` }),
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Veggie chilli' }));
    expect(within(tuesday).getByDisplayValue('Veggie chilli')).toBeInTheDocument();
    expect(
      within(tuesday).getByRole('link', { name: 'Open recipe Veggie chilli' }),
    ).toHaveAttribute('href', expect.stringContaining('/recipes'));
    fireEvent.click(within(tuesday).getByRole('button', { name: 'Unlink recipe Veggie chilli' }));
    expect(within(tuesday).queryByRole('link', { name: /Open recipe/ })).not.toBeInTheDocument();
    expect(within(tuesday).getByDisplayValue('Veggie chilli')).toBeInTheDocument();
  });

  it('shows the recipe links already on the planner', async () => {
    await renderMeals(true);
    const monday = screen.getByRole('region', { name: 'Monday' });
    expect(
      within(monday).getByRole('link', { name: 'Open recipe Spaghetti + mince' }),
    ).toBeInTheDocument();
  });

  it('marks exactly one weekday as today in the planner', async () => {
    await renderMeals(true);
    expect(screen.getAllByText('Today')).toHaveLength(1);
  });
});

describe('Meals planner', () => {
  const openPlanner = () => renderMeals(true);

  it('offers to add the ingredients of a recipe line to the list', async () => {
    await openPlanner();
    const monday = screen.getByRole('region', { name: 'Monday' });

    fireEvent.click(
      within(monday).getByRole('button', {
        name: `${PLANNER_COPY.addIngredients} Spaghetti + mince`,
      }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Add to Chop list/)).toBeInTheDocument();
  });

  it('does not offer ingredients on a line without a recipe', async () => {
    await openPlanner();
    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));

    expect(
      within(sunday).queryByRole('button', { name: new RegExp(PLANNER_COPY.addIngredients) }),
    ).not.toBeInTheDocument();
  });

  it('starts the next line when Enter is pressed on a line with text', async () => {
    await openPlanner();
    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));
    const before = within(sunday).getAllByRole('textbox').length;
    const input = within(sunday).getAllByRole('textbox').at(-1) ?? sunday;
    fireEvent.change(input, { target: { value: 'Pancakes' } });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(within(sunday).getAllByRole('textbox')).toHaveLength(before + 1);
    expect(within(sunday).getAllByRole('textbox').at(-1)).toHaveFocus();
  });

  it('does not add another line when Enter is pressed on an empty line', async () => {
    await openPlanner();
    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));
    const before = within(sunday).getAllByRole('textbox').length;

    fireEvent.keyDown(within(sunday).getAllByRole('textbox').at(-1) ?? sunday, { key: 'Enter' });

    expect(within(sunday).getAllByRole('textbox')).toHaveLength(before);
  });

  it('shows no recipe button on a plain line such as carrots', async () => {
    await openPlanner();
    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));
    fireEvent.change(within(sunday).getAllByRole('textbox').at(-1) ?? sunday, {
      target: { value: 'Carrots' },
    });

    expect(within(sunday).queryByText('Pick recipe')).not.toBeInTheDocument();
    expect(
      within(sunday).queryByRole('button', { name: new RegExp(PLANNER_COPY.addIngredients) }),
    ).not.toBeInTheDocument();
  });

  it('swaps the recipe on a line in place', async () => {
    await openPlanner();
    const monday = screen.getByRole('region', { name: 'Monday' });

    fireEvent.click(
      within(monday).getByRole('button', {
        name: `${PLANNER_COPY.changeRecipe} Spaghetti + mince`,
      }),
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Veggie chilli' }));

    expect(within(monday).getByDisplayValue('Veggie chilli')).toBeInTheDocument();
    expect(within(monday).queryByDisplayValue('Spaghetti + mince')).not.toBeInTheDocument();
    expect(
      within(monday).getByRole('link', { name: 'Open recipe Veggie chilli' }),
    ).toBeInTheDocument();
  });

  it('links a recipe to a plain line that was already typed', async () => {
    await openPlanner();
    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));
    fireEvent.change(within(sunday).getAllByRole('textbox').at(-1) ?? sunday, {
      target: { value: 'Jacket potatoes' },
    });

    fireEvent.click(
      within(sunday).getByRole('button', { name: `${PLANNER_COPY.linkRecipe} Jacket potatoes` }),
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Veggie chilli' }));

    expect(within(sunday).getByDisplayValue('Veggie chilli')).toBeInTheDocument();
    expect(
      within(sunday).getByRole('link', { name: 'Open recipe Veggie chilli' }),
    ).toBeInTheDocument();
  });

  it('keeps ingredients and steps behind a toggle on recipe lines only', async () => {
    await openPlanner();
    const monday = screen.getByRole('region', { name: 'Monday' });

    expect(within(monday).getByText(PLANNER_COPY.recipeDetails)).toBeInTheDocument();
    expect(within(monday).getByText('500 g beef mince')).toBeInTheDocument();
    expect(
      within(monday).getByText('Brown the mince, add the tomatoes and simmer for 30 minutes.'),
    ).toBeInTheDocument();

    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));
    expect(within(sunday).queryByText(PLANNER_COPY.recipeDetails)).not.toBeInTheDocument();
  });

  it('lists the rest of the week under the day and jumps to a day on tap', async () => {
    await openPlanner();
    const strip = screen.getByRole('group', { name: PLANNER_COPY.dayStrip });
    fireEvent.click(within(strip).getByRole('button', { name: `${PLANNER_COPY.showDay} Sunday` }));
    const glance = screen.getByRole('list', { name: PLANNER_COPY.weekGlance });

    fireEvent.click(within(glance).getByRole('button', { name: /Monday/ }));

    expect(
      within(strip).getByRole('button', { name: `${PLANNER_COPY.showDay} Monday` }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens on today in the day strip and switches day on tap', async () => {
    await openPlanner();
    const todayName = formatWeekdayName({ weekday: new Date().getDay() });
    const otherName = todayName === 'Tuesday' ? 'Wednesday' : 'Tuesday';
    const strip = screen.getByRole('group', { name: PLANNER_COPY.dayStrip });

    expect(
      within(strip).getByRole('button', { name: `${PLANNER_COPY.showDay} ${todayName}` }),
    ).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(
      within(strip).getByRole('button', { name: `${PLANNER_COPY.showDay} ${otherName}` }),
    );

    expect(
      within(strip).getByRole('button', { name: `${PLANNER_COPY.showDay} ${otherName}` }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(strip).getByRole('button', { name: `${PLANNER_COPY.showDay} ${todayName}` }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
