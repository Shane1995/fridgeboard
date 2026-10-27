import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { Calendar } from './index';
import { CALENDAR_COPY } from './constants';
import { addDays } from './utils/addDays';
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
  const rootRoute = createRootRoute();
  const page = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
      <TestProviders session={session} config={config}>
        <Calendar />
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

describe('Calendar', () => {
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
