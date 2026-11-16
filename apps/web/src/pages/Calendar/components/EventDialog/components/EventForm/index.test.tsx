import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ShopColor } from '../../../../../../services/shoppingList/constants';
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

describe('EventForm who, colour and reminder', () => {
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
    fireEvent.change(screen.getByLabelText(EVENT_FORM_COPY.titleLabel), {
      target: { value: 'Picnic' },
    });
    return { onSave };
  };

  const save = () => fireEvent.click(screen.getByRole('button', { name: EVENT_FORM_COPY.create }));

  it('offers who it is for as tappable choices, starting with the household', () => {
    setUpNew();

    const group = screen.getByRole('radiogroup', { name: EVENT_FORM_COPY.ownerLabel });

    expect(within(group).getAllByRole('radio').length).toBeGreaterThan(1);
    expect(within(group).getByRole('radio', { name: 'Household' })).toBeChecked();
  });

  it('saves the owner that was picked', () => {
    const { onSave } = setUpNew();
    const group = screen.getByRole('radiogroup', { name: EVENT_FORM_COPY.ownerLabel });
    const other = within(group)
      .getAllByRole('radio')
      .find((radio) => !(radio as HTMLInputElement).checked) as HTMLElement;

    fireEvent.click(other);
    save();

    expect(onSave).toHaveBeenCalledWith(expect.not.objectContaining({ ownerId: 'household' }));
  });

  it('starts with no colour of its own and saves the one that is picked', () => {
    const { onSave } = setUpNew();
    const colours = screen.getByRole('group', { name: EVENT_FORM_COPY.colorLabel });
    expect(
      within(colours).getByRole('button', { name: EVENT_FORM_COPY.defaultColor }),
    ).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(within(colours).getByRole('button', { name: 'mint' }));
    save();

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ color: 'mint' }));
  });

  it('can go back to the owner colour after picking one', () => {
    const { onSave } = setUpNew();
    const colours = screen.getByRole('group', { name: EVENT_FORM_COPY.colorLabel });
    fireEvent.click(within(colours).getByRole('button', { name: 'mint' }));

    fireEvent.click(within(colours).getByRole('button', { name: EVENT_FORM_COPY.defaultColor }));
    save();

    expect(onSave).toHaveBeenCalledWith(expect.not.objectContaining({ color: 'mint' }));
  });

  it('starts with no reminder and saves the one that is picked', () => {
    const { onSave } = setUpNew();
    const reminder = screen.getByLabelText(EVENT_FORM_COPY.reminderLabel);
    expect(reminder).toHaveValue('none');

    fireEvent.change(reminder, { target: { value: '30' } });
    save();

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ reminder: 30 }));
  });

  it('can set a reminder for the moment the event starts', () => {
    const { onSave } = setUpNew();

    fireEvent.change(screen.getByLabelText(EVENT_FORM_COPY.reminderLabel), {
      target: { value: '0' },
    });
    save();

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ reminder: 0 }));
  });

  it('can take a reminder off again', () => {
    const { onSave } = setUpNew();
    const reminder = screen.getByLabelText(EVENT_FORM_COPY.reminderLabel);
    fireEvent.change(reminder, { target: { value: '30' } });

    fireEvent.change(reminder, { target: { value: 'none' } });
    save();

    expect(onSave).toHaveBeenCalledWith(expect.not.objectContaining({ reminder: 30 }));
    expect(onSave.mock.calls[0]?.[0]).not.toHaveProperty('reminder');
  });

  it('shows the colour and reminder an existing event already has', () => {
    render(
      <TestProviders session={session}>
        <EventForm
          event={buildEvent({
            id: 'e3',
            draft: {
              title: 'Trip',
              allDay: true,
              date: '2026-11-03',
              startTime: '09:00',
              endTime: '10:00',
              ownerId: 'household',
              note: '',
              color: ShopColor.Sky,
              reminder: 60,
            },
          })}
          date="2026-11-03"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onDone={vi.fn()}
        />
      </TestProviders>,
    );

    expect(screen.getByRole('button', { name: 'sky' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(EVENT_FORM_COPY.reminderLabel)).toHaveValue('60');
  });
});
