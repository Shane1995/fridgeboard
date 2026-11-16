import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionStatus } from '../../../../../../services/session/constants';
import { createSession } from '../../../../../../testUtils/createSession';
import { TestProviders } from '../../../../../../testUtils/TestProviders';
import { buildEvent } from '../../../../utils/buildEvent';
import { EVENT_FORM_COPY } from './constants';
import { EventForm } from './index';

const EVENT = buildEvent({
  id: 'e1',
  draft: {
    title: 'Dentist',
    allDay: false,
    date: '2026-11-03',
    startTime: '09:00',
    endTime: '10:00',
    ownerId: 'household',
    note: '',
  },
});

const { session } = createSession(SessionStatus.SignedIn);

const setUp = () => {
  const onDelete = vi.fn();
  const onDone = vi.fn();
  render(
    <TestProviders session={session}>
      <EventForm
        event={EVENT}
        date="2026-11-03"
        onSave={vi.fn()}
        onDelete={onDelete}
        onDone={onDone}
      />
    </TestProviders>,
  );
  return { onDelete, onDone };
};

describe('EventForm deleting', () => {
  it('asks before deleting and does not delete yet', async () => {
    const { onDelete } = setUp();

    fireEvent.click(screen.getByRole('button', { name: EVENT_FORM_COPY.delete }));

    expect(await screen.findByText(EVENT_FORM_COPY.confirmTitle('Dentist'))).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('deletes and closes once confirmed', async () => {
    const { onDelete, onDone } = setUp();
    fireEvent.click(screen.getByRole('button', { name: EVENT_FORM_COPY.delete }));

    fireEvent.click(await screen.findByRole('button', { name: EVENT_FORM_COPY.confirm }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('keeps the event when the dialog is cancelled', async () => {
    const { onDelete, onDone } = setUp();
    fireEvent.click(screen.getByRole('button', { name: EVENT_FORM_COPY.delete }));

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(screen.queryByText(EVENT_FORM_COPY.confirmTitle('Dentist'))).not.toBeInTheDocument(),
    );
    expect(onDelete).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});

describe('EventForm last day', () => {
  const setUpNew = () => {
    const onSave = vi.fn();
    render(
      <TestProviders session={session}>
        <EventForm
          event={undefined}
          date="2026-11-03"
          onSave={onSave}
          onDelete={vi.fn()}
          onDone={vi.fn()}
        />
      </TestProviders>,
    );
    return { onSave };
  };

  const lastDay = () => screen.getByLabelText(EVENT_FORM_COPY.lastDayLabel);

  it('has no last day for a timed event', () => {
    setUpNew();

    expect(screen.queryByLabelText(EVENT_FORM_COPY.lastDayLabel)).not.toBeInTheDocument();
  });

  it('asks for a last day once the event is all day, starting on the same date', () => {
    setUpNew();

    fireEvent.click(screen.getByLabelText(EVENT_FORM_COPY.allDayLabel));

    expect(lastDay()).toHaveValue('2026-11-03');
    expect(lastDay()).toHaveAttribute('min', '2026-11-03');
  });

  it('saves a multi-day event with its last day', () => {
    const { onSave } = setUpNew();
    fireEvent.change(screen.getByLabelText(EVENT_FORM_COPY.titleLabel), {
      target: { value: 'Trip' },
    });
    fireEvent.click(screen.getByLabelText(EVENT_FORM_COPY.allDayLabel));

    fireEvent.change(lastDay(), { target: { value: '2026-11-06' } });
    fireEvent.click(screen.getByRole('button', { name: EVENT_FORM_COPY.create }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ allDay: true, date: '2026-11-03', endDate: '2026-11-06' }),
    );
  });

  it('moves the last day along when the first day is moved past it', () => {
    setUpNew();
    fireEvent.click(screen.getByLabelText(EVENT_FORM_COPY.allDayLabel));

    fireEvent.change(screen.getByLabelText(EVENT_FORM_COPY.dateLabel), {
      target: { value: '2026-11-10' },
    });

    expect(lastDay()).toHaveValue('2026-11-10');
  });

  it('shows an existing multi-day event with its last day', () => {
    render(
      <TestProviders session={session}>
        <EventForm
          event={buildEvent({
            id: 'e2',
            draft: {
              title: 'Trip',
              allDay: true,
              date: '2026-11-03',
              endDate: '2026-11-05',
              startTime: '09:00',
              endTime: '10:00',
              ownerId: 'household',
              note: '',
            },
          })}
          date="2026-11-03"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onDone={vi.fn()}
        />
      </TestProviders>,
    );

    expect(lastDay()).toHaveValue('2026-11-05');
  });
});

describe('EventForm keyboard', () => {
  const renderNew = () =>
    render(
      <TestProviders session={session}>
        <EventForm
          event={undefined}
          date="2026-11-03"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onDone={vi.fn()}
        />
      </TestProviders>,
    );

  afterEach(() => vi.unstubAllGlobals());

  it('does not focus the title on a touch device, so the keyboard stays closed', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    renderNew();

    expect(screen.getByLabelText(EVENT_FORM_COPY.titleLabel)).not.toHaveFocus();
  });

  it('focuses the title when the device has a fine pointer', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    renderNew();

    expect(screen.getByLabelText(EVENT_FORM_COPY.titleLabel)).toHaveFocus();
  });
});
