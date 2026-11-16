import { fireEvent, screen, within } from '@testing-library/react';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { renderInRouter } from '../../testUtils/renderInRouter';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { Calendar } from './index';
import { CALENDAR_COPY } from './constants';
import { PLANNER_COPY } from './components/Planner/constants';
import { addDays } from './utils/addDays';
import { formatWeekdayName } from './utils/formatWeekdayName';
import { formatDayHeading } from './utils/formatDayHeading';
import { getToday } from './utils/getToday';

const { session } = createSession(SessionStatus.SignedIn);

const renderCalendar = async (enabled: boolean) => {
  const config = {
    ...TEST_WEB_CONFIGURATION,
    featureFlags: {
      ...TEST_WEB_CONFIGURATION.featureFlags,
      [WebFeatureFlag.ENABLE_CALENDAR]: enabled,
    },
  };
  await renderInRouter(
    <TestProviders session={session} config={config}>
      <Calendar />
    </TestProviders>,
  );
};

describe('Calendar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the placeholder while the flag is off', async () => {
    await renderCalendar(false);
    expect(screen.getByRole('heading', { name: CALENDAR_COPY.title })).toBeInTheDocument();
    expect(screen.getByText(CALENDAR_COPY.placeholder)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: CALENDAR_COPY.addEvent })).not.toBeInTheDocument();
  });

  it('shows today in the agenda with its dummy event', async () => {
    await renderCalendar(true);
    const today = getToday({ now: new Date() });
    const agenda = screen.getByRole('region', { name: formatDayHeading({ date: today }) });
    expect(within(agenda).getByText('Pizza night')).toBeInTheDocument();
  });

  it('switches to the week view and back', async () => {
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.week }));
    expect(screen.getAllByRole('region')).toHaveLength(7);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.month }));
    expect(screen.getAllByRole('region')).toHaveLength(1);
  });

  it('selects another day in the month grid', async () => {
    await renderCalendar(true);
    const today = getToday({ now: new Date() });
    const other = screen
      .getAllByRole('button', { pressed: false })
      .find((button) => button.getAttribute('aria-label')?.match(/^\w+ \d+ \w+$/));
    expect(other).toBeDefined();
    if (other !== undefined) {
      fireEvent.click(other);
      expect(screen.queryByRole('region', { name: formatDayHeading({ date: today }) })).toBeNull();
    }
  });

  it('adds an event on a chosen day from the week view', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-28T12:00:00'));
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.week }));
    const target = addDays({ date: getToday({ now: new Date() }), days: 1 });
    const heading = formatDayHeading({ date: target });
    fireEvent.click(screen.getByRole('button', { name: `${CALENDAR_COPY.addEventOn} ${heading}` }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Date')).toHaveValue(target);
  });

  it('shows a date-free planner and edits a meal line', async () => {
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.planner }));
    expect(screen.queryByRole('button', { name: CALENDAR_COPY.addEvent })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: CALENDAR_COPY.today })).not.toBeInTheDocument();
    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));
    const input = within(sunday).getAllByRole('textbox').at(-1);
    expect(input).toBeDefined();
    if (input !== undefined) {
      fireEvent.change(input, { target: { value: 'Pancakes' } });
    }
    expect(within(sunday).getByDisplayValue('Pancakes')).toBeInTheDocument();
  });

  it('links a planner line to a recipe and opens it from the line', async () => {
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.planner }));
    const tuesday = screen.getByRole('region', { name: 'Tuesday' });
    fireEvent.click(within(tuesday).getByRole('button', { name: 'Add line Tuesday' }));
    fireEvent.click(
      within(tuesday).getAllByRole('button', { name: 'Pick recipe Tuesday' }).at(-1) ?? tuesday,
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
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.planner }));
    const monday = screen.getByRole('region', { name: 'Monday' });
    expect(
      within(monday).getByRole('link', { name: 'Open recipe Spaghetti + mince' }),
    ).toBeInTheDocument();
  });

  it('marks exactly one weekday as today in the planner', async () => {
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.planner }));
    expect(screen.getAllByText('Today')).toHaveLength(1);
  });

  it('keeps planner edits when switching views', async () => {
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.planner }));
    fireEvent.click(screen.getByRole('button', { name: 'Add notes box' }));
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.month }));
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.planner }));
    expect(screen.getByRole('region', { name: 'New box' })).toBeInTheDocument();
  });

  it('adds an event from the dialog', async () => {
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.addEvent }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('textbox', { name: /title/i }), {
      target: { value: 'Garden party' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add event' }));
    expect((await screen.findAllByText('Garden party')).length).toBeGreaterThan(0);
  });
});

describe('Calendar planner', () => {
  const openPlanner = async () => {
    await renderCalendar(true);
    fireEvent.click(screen.getByRole('button', { name: CALENDAR_COPY.planner }));
  };

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

  it('labels the recipe picker with words', async () => {
    await openPlanner();
    const sunday = screen.getByRole('region', { name: 'Sunday' });
    fireEvent.click(within(sunday).getByRole('button', { name: 'Add line Sunday' }));

    expect(
      within(sunday)
        .getAllByRole('button', { name: `${PLANNER_COPY.linkRecipe} Sunday` })
        .at(-1),
    ).toHaveTextContent(PLANNER_COPY.linkRecipe);
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
