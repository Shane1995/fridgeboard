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
