import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../../../../../services/shoppingList/constants';
import { PLANNER_COPY } from '../../constants';
import { PlannerSection } from './index';

const NOTE = { id: 'n1', title: 'Holiday ideas', lines: [{ id: 'l1', text: 'Lisbon' }] };

const setUp = () => {
  const onDelete = vi.fn();
  render(
    <PlannerSection
      section={NOTE}
      color={ShopColor.Slate}
      isToday={false}
      focusId={undefined}
      onAddLine={vi.fn()}
      onUpdateLine={vi.fn()}
      onRemoveLine={vi.fn()}
      recipeIngredientCounts={new Map()}
      onAddIngredients={vi.fn()}
      onPickRecipe={vi.fn()}
      onUnlinkRecipe={vi.fn()}
      onRename={vi.fn()}
      onDelete={onDelete}
    />,
  );
  return { onDelete };
};

describe('PlannerSection deleting a notes box', () => {
  it('asks before deleting and does not delete yet', async () => {
    const { onDelete } = setUp();

    fireEvent.click(
      screen.getByRole('button', { name: `${PLANNER_COPY.deleteNote} Holiday ideas` }),
    );

    expect(
      await screen.findByText(PLANNER_COPY.confirmNoteTitle('Holiday ideas')),
    ).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('deletes the box once confirmed', async () => {
    const { onDelete } = setUp();
    fireEvent.click(
      screen.getByRole('button', { name: `${PLANNER_COPY.deleteNote} Holiday ideas` }),
    );

    fireEvent.click(await screen.findByRole('button', { name: PLANNER_COPY.confirmNote }));

    expect(onDelete).toHaveBeenCalledWith({ sectionId: 'n1' });
  });

  it('keeps the box when the dialog is cancelled', async () => {
    const { onDelete } = setUp();
    fireEvent.click(
      screen.getByRole('button', { name: `${PLANNER_COPY.deleteNote} Holiday ideas` }),
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(
        screen.queryByText(PLANNER_COPY.confirmNoteTitle('Holiday ideas')),
      ).not.toBeInTheDocument(),
    );
    expect(onDelete).not.toHaveBeenCalled();
  });
});
