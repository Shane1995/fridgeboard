import { CalendarDays, ChefHat, ListChecks, Settings, UtensilsCrossed } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Chop list', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

export const NAV_LABEL = 'Main';

export const APP_NAME = 'Fridgeboard';
