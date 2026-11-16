export const EVENT_FORM_COPY = {
  titleLabel: 'Title',
  allDayLabel: 'All day',
  dateLabel: 'Date',
  lastDayLabel: 'Last day',
  startLabel: 'Starts',
  endLabel: 'Ends',
  ownerLabel: 'Who',
  colorLabel: 'Colour',
  defaultColor: 'Default',
  reminderLabel: 'Reminder',
  noteLabel: 'Note',
  repeatLabel: 'Repeat',
  repeatNever: 'Never',
  repeatDaily: 'Daily',
  repeatWeekly: 'Weekly',
  repeatMonthly: 'Monthly',
  everyLabel: 'Every',
  untilLabel: 'Until (optional)',
  saveThis: 'Save this event',
  saveAll: 'Save all events',
  deleteThis: 'Delete this event',
  deleteAll: 'Delete all events',
  confirmTitleThis: 'Delete this event?',
  confirmTitleAll: 'Delete all events?',
  confirmDescriptionThis: 'Only this day comes off the calendar. The rest of the series stays.',
  confirmDescriptionAll: 'Every day of this series comes off the calendar for everyone.',
  create: 'Add event',
  save: 'Save',
  delete: 'Delete event',
  confirmTitle: (title: string) => `Delete ${title}?`,
  confirmDescription: 'It comes off the calendar for everyone.',
  confirm: 'Delete',
} as const;

export const FIELD_CLASS =
  'block w-full min-w-0 max-w-full appearance-none rounded-xl border border-separator bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-focus';

export const REPEAT_OPTIONS = [
  { value: 'never', label: EVENT_FORM_COPY.repeatNever },
  { value: 'daily', label: EVENT_FORM_COPY.repeatDaily },
  { value: 'weekly', label: EVENT_FORM_COPY.repeatWeekly },
  { value: 'monthly', label: EVENT_FORM_COPY.repeatMonthly },
] as const;

export const WEEKDAYS = [
  { value: 0, short: 'S', name: 'Sunday' },
  { value: 1, short: 'M', name: 'Monday' },
  { value: 2, short: 'T', name: 'Tuesday' },
  { value: 3, short: 'W', name: 'Wednesday' },
  { value: 4, short: 'T', name: 'Thursday' },
  { value: 5, short: 'F', name: 'Friday' },
  { value: 6, short: 'S', name: 'Saturday' },
] as const;

export const EVERY_MAX = 52;
