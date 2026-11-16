import { SHOP_COLOR_CLASSES } from '../../../../../../components/ShopSwatch/constants';
import { Typography } from '../../../../../../components/Typography';
import { TypographyVariant } from '../../../../../../components/Typography/constants';
import { ShopColor } from '../../../../../../services/shoppingList/constants';
import { PLANNER_COPY, PLANNER_DAY_COLORS } from '../../constants';
import type { WeekGlanceProps } from './types';

export const WeekGlance = ({ days, selectedWeekday, onSelect }: WeekGlanceProps) => {
  const planned = days
    .filter((day) => day.weekday !== selectedWeekday)
    .map((day) => ({
      day,
      meals: day.lines.map((line) => line.text.trim()).filter((text) => text !== ''),
    }))
    .filter(({ meals }) => meals.length > 0);

  if (planned.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 md:hidden">
      <Typography variant={TypographyVariant.Caption} as="h2">
        {PLANNER_COPY.weekGlance}
      </Typography>
      <ul
        aria-label={PLANNER_COPY.weekGlance}
        className="flex flex-col divide-y divide-foreground/5 overflow-hidden rounded-2xl border border-foreground/10 bg-white"
      >
        {planned.map(({ day, meals }) => (
          <li key={day.id}>
            <button
              type="button"
              onClick={() => onSelect({ weekday: day.weekday ?? 0 })}
              className="flex min-h-12 w-full cursor-pointer items-center gap-3 px-4 py-2 text-left outline-none hover:bg-default focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
            >
              <span
                aria-hidden
                className={`size-2.5 shrink-0 rounded-full ${SHOP_COLOR_CLASSES[PLANNER_DAY_COLORS[day.weekday ?? 0] ?? ShopColor.Slate]}`}
              />
              <span className="w-24 shrink-0 text-sm font-semibold">{day.title}</span>
              <span className="min-w-0 truncate text-sm text-foreground/70">
                {meals.join(', ')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
