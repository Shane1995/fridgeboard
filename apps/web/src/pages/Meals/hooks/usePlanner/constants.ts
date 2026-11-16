export const NEW_NOTE_TITLE = 'New box';

export const PLANNER_TOAST_COPY = {
  lineRemoved: 'Line removed',
  undo: 'Undo',
  noteAdded: 'Notes box added',
  noteDeleted: (title: string) => `${title} deleted`,
} as const;
