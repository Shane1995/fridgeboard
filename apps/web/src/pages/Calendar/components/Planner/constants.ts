import { ShopColor } from '../../../../services/shoppingList/constants';
import type { SectionStyle } from './types';

export const PLANNER_COPY = {
  addLine: 'Add line',
  removeLine: 'Remove line',
  lineLabel: 'line',
  linePlaceholder: 'Add a meal',
  addNote: 'Add notes box',
  deleteNote: 'Delete box',
  noteTitleLabel: 'Box title',
  notesHeading: 'Notes',
  emptySection: 'Nothing planned yet.',
  today: 'Today',
} as const;

export const PLANNER_LINE_MAX_LENGTH = 120;
export const PLANNER_TITLE_MAX_LENGTH = 40;

export const PLANNER_INPUT_CLASS =
  'block w-full min-w-0 rounded-xl border border-black/10 bg-white/80 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-focus';

export const PLANNER_DAY_COLORS: readonly ShopColor[] = [
  ShopColor.Tomato,
  ShopColor.Sky,
  ShopColor.Mint,
  ShopColor.Grape,
  ShopColor.Orange,
  ShopColor.Pink,
  ShopColor.Cyan,
];

export const PLANNER_NOTE_COLOR = ShopColor.Mustard;

export const SECTION_STYLES: Record<ShopColor, SectionStyle> = {
  [ShopColor.Tomato]: {
    surface: 'bg-[color-mix(in_srgb,#e2462f_12%,white)]',
    border: 'border-[color-mix(in_srgb,#e2462f_40%,white)]',
  },
  [ShopColor.Mustard]: {
    surface: 'bg-[color-mix(in_srgb,#edb02b_12%,white)]',
    border: 'border-[color-mix(in_srgb,#edb02b_40%,white)]',
  },
  [ShopColor.Mint]: {
    surface: 'bg-[color-mix(in_srgb,#26a383_12%,white)]',
    border: 'border-[color-mix(in_srgb,#26a383_40%,white)]',
  },
  [ShopColor.Sky]: {
    surface: 'bg-[color-mix(in_srgb,#3b82c4_12%,white)]',
    border: 'border-[color-mix(in_srgb,#3b82c4_40%,white)]',
  },
  [ShopColor.Grape]: {
    surface: 'bg-[color-mix(in_srgb,#8b5cb8_12%,white)]',
    border: 'border-[color-mix(in_srgb,#8b5cb8_40%,white)]',
  },
  [ShopColor.Pink]: {
    surface: 'bg-[color-mix(in_srgb,#d63f80_12%,white)]',
    border: 'border-[color-mix(in_srgb,#d63f80_40%,white)]',
  },
  [ShopColor.Slate]: {
    surface: 'bg-[color-mix(in_srgb,#6b7885_12%,white)]',
    border: 'border-[color-mix(in_srgb,#6b7885_40%,white)]',
  },
  [ShopColor.Black]: {
    surface: 'bg-[color-mix(in_srgb,#1f1f1f_12%,white)]',
    border: 'border-[color-mix(in_srgb,#1f1f1f_40%,white)]',
  },
  [ShopColor.Forest]: {
    surface: 'bg-[color-mix(in_srgb,#17603f_12%,white)]',
    border: 'border-[color-mix(in_srgb,#17603f_40%,white)]',
  },
  [ShopColor.Lime]: {
    surface: 'bg-[color-mix(in_srgb,#78be20_12%,white)]',
    border: 'border-[color-mix(in_srgb,#78be20_40%,white)]',
  },
  [ShopColor.Orange]: {
    surface: 'bg-[color-mix(in_srgb,#f06c00_12%,white)]',
    border: 'border-[color-mix(in_srgb,#f06c00_40%,white)]',
  },
  [ShopColor.Navy]: {
    surface: 'bg-[color-mix(in_srgb,#0f3f8c_12%,white)]',
    border: 'border-[color-mix(in_srgb,#0f3f8c_40%,white)]',
  },
  [ShopColor.Cyan]: {
    surface: 'bg-[color-mix(in_srgb,#00a3dd_12%,white)]',
    border: 'border-[color-mix(in_srgb,#00a3dd_40%,white)]',
  },
  [ShopColor.Yellow]: {
    surface: 'bg-[color-mix(in_srgb,#f9d71c_12%,white)]',
    border: 'border-[color-mix(in_srgb,#f9d71c_40%,white)]',
  },
};
