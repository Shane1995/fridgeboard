import { act, renderHook } from '@testing-library/react';
import { useEventForm } from '.';

const setup = (overrides = {}) => {
  const onSave = vi.fn();
  const onDelete = vi.fn();
  const onDone = vi.fn();
  const hook = renderHook(() =>
    useEventForm({ event: undefined, date: '2026-11-03', onSave, onDelete, onDone, ...overrides }),
  );
  return { ...hook, onSave, onDelete, onDone };
};

const submit = () => ({ preventDefault: vi.fn() }) as never;

describe('useEventForm', () => {
  it('starts a new event on the given date for the household', () => {
    const { result } = setup();
    expect(result.current.draft).toMatchObject({
      title: '',
      date: '2026-11-03',
      ownerId: 'household',
      allDay: false,
    });
  });

  it('does not save without a title', () => {
    const { result, onSave, onDone } = setup();
    act(() => result.current.handleSubmit(submit()));
    expect(onSave).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('saves the draft and closes', () => {
    const { result, onSave, onDone } = setup();
    act(() => result.current.setField({ field: 'title', value: 'Picnic' }));
    act(() => result.current.handleSubmit(submit()));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Picnic' }));
    expect(onDone).toHaveBeenCalled();
  });

  it('deletes and closes', () => {
    const { result, onDelete, onDone } = setup();
    act(() => result.current.handleDelete());
    expect(onDelete).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });
});
