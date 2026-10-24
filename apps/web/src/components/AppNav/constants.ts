import { CalendarDays, ChefHat, ListChecks } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Chop list', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
] as const;

export const NAV_LABEL = 'Main';

export const APP_NAME = 'Fridgeboard';
