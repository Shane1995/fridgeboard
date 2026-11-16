import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { createElement } from 'react';
import type { PropsWithChildren } from 'react';
import { ToastProvider } from '../../../../Context/Toast';
import { PLANNER_TOAST_COPY } from './constants';
import { usePlanner } from '.';

describe('usePlanner', () => {
  it('starts with seven weekdays and some notes boxes', () => {
    const { result } = renderHook(() => usePlanner());
    expect(result.current.days).toHaveLength(7);
    expect(result.current.days[0]?.title).toBe('Sunday');
    expect(result.current.notes.length).toBeGreaterThan(0);
  });

  it('knows which weekday is today', () => {
    const { result } = renderHook(() => usePlanner());
    expect(result.current.todayWeekday).toBeGreaterThanOrEqual(0);
    expect(result.current.todayWeekday).toBeLessThanOrEqual(6);
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

  it('adds a recipe as a line and unlinks it, keeping the name', () => {
    const { result } = renderHook(() => usePlanner());
    const sectionId = result.current.days[3]?.id ?? '';
    const before = result.current.days[3]?.lines.length ?? 0;

    act(() =>
      result.current.addRecipeLine({
        sectionId,
        recipeId: 'mock-soup',
        name: 'Butternut squash soup',
      }),
    );
    expect(result.current.days[3]?.lines).toHaveLength(before + 1);
    const line = result.current.days[3]?.lines.at(-1);
    expect(line).toMatchObject({ recipeId: 'mock-soup', text: 'Butternut squash soup' });

    act(() => result.current.unlinkRecipe({ sectionId, lineId: line?.id ?? '' }));
    expect(result.current.days[3]?.lines.at(-1)?.recipeId).toBeUndefined();
    expect(result.current.days[3]?.lines.at(-1)?.text).toBe('Butternut squash soup');
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

  describe('telling the user what happened', () => {
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(ToastProvider, null, children);

    const addLine = (result: { current: ReturnType<typeof usePlanner> }, text: string) => {
      const sectionId = result.current.days[2]?.id ?? '';
      act(() => result.current.addLine({ sectionId }));
      const lineId = result.current.days[2]?.lines.at(-1)?.id ?? '';
      act(() => result.current.updateLine({ sectionId, lineId, text }));
      return { sectionId, lineId };
    };

    it('offers Undo when a line is removed', async () => {
      const { result } = renderHook(() => usePlanner(), { wrapper });
      const { sectionId, lineId } = addLine(result, 'Tacos');

      act(() => result.current.removeLine({ sectionId, lineId }));

      expect(await screen.findByText(PLANNER_TOAST_COPY.lineRemoved)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: PLANNER_TOAST_COPY.undo })).toBeInTheDocument();
    });

    it('puts the line back in the same place when Undo is pressed', async () => {
      const { result } = renderHook(() => usePlanner(), { wrapper });
      const { sectionId, lineId } = addLine(result, 'Tacos');
      const lines = result.current.days[2]?.lines ?? [];
      const index = lines.findIndex((line) => line.id === lineId);
      act(() => result.current.removeLine({ sectionId, lineId }));

      fireEvent.click(await screen.findByRole('button', { name: PLANNER_TOAST_COPY.undo }));

      expect(result.current.days[2]?.lines[index]).toMatchObject({ id: lineId, text: 'Tacos' });
      expect(result.current.days[2]?.lines).toHaveLength(lines.length);
    });

    it('says nothing when removing an empty line', () => {
      const { result } = renderHook(() => usePlanner(), { wrapper });
      const sectionId = result.current.days[2]?.id ?? '';
      act(() => result.current.addLine({ sectionId }));
      const lineId = result.current.days[2]?.lines.at(-1)?.id ?? '';

      act(() => result.current.removeLine({ sectionId, lineId }));

      expect(screen.queryByText(PLANNER_TOAST_COPY.lineRemoved)).not.toBeInTheDocument();
    });

    it('says a notes box was added and deleted', async () => {
      const { result } = renderHook(() => usePlanner(), { wrapper });
      const title = result.current.notes[0]?.title ?? '';

      act(() => result.current.addNote());
      expect(await screen.findByText(PLANNER_TOAST_COPY.noteAdded)).toBeInTheDocument();

      act(() => result.current.deleteNote({ sectionId: result.current.notes[0]?.id ?? '' }));
      expect(await screen.findByText(PLANNER_TOAST_COPY.noteDeleted(title))).toBeInTheDocument();
    });
  });
});
