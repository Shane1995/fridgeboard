import { act, renderHook } from '@testing-library/react';
import { usePlanner } from '.';

describe('usePlanner', () => {
  it('starts with seven weekdays and some notes boxes', () => {
    const { result } = renderHook(() => usePlanner());
    expect(result.current.days).toHaveLength(7);
    expect(result.current.days[0]?.title).toBe('Sunday');
    expect(result.current.notes.length).toBeGreaterThan(0);
  });

  it('adds, edits and removes a line on a day', () => {
    const { result } = renderHook(() => usePlanner());
    const sectionId = result.current.days[2]?.id ?? '';
    const before = result.current.days[2]?.lines.length ?? 0;

    act(() => result.current.addLine({ sectionId }));
    const added = result.current.days[2]?.lines.at(-1);
    expect(result.current.days[2]?.lines).toHaveLength(before + 1);
    expect(result.current.focusId).toBe(added?.id);

    act(() => result.current.updateLine({ sectionId, lineId: added?.id ?? '', text: 'Tacos' }));
    expect(result.current.days[2]?.lines.at(-1)?.text).toBe('Tacos');

    act(() => result.current.removeLine({ sectionId, lineId: added?.id ?? '' }));
    expect(result.current.days[2]?.lines).toHaveLength(before);
  });

  it('adds, renames and deletes a notes box', () => {
    const { result } = renderHook(() => usePlanner());
    const before = result.current.notes.length;

    act(() => result.current.addNote());
    const added = result.current.notes.at(-1);
    expect(result.current.notes).toHaveLength(before + 1);

    act(() => result.current.renameNote({ sectionId: added?.id ?? '', title: 'Freezer' }));
    expect(result.current.notes.at(-1)?.title).toBe('Freezer');

    act(() => result.current.deleteNote({ sectionId: added?.id ?? '' }));
    expect(result.current.notes).toHaveLength(before);
  });
});
