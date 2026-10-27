import {
  SHOP_COLOR_CLASSES,
  SHOP_TEXT_CLASSES,
} from '../../../../../../components/ShopSwatch/constants';
import { CALENDAR_COPY, MAX_CHIPS_PER_DAY } from '../../../../constants';
import { findOwner } from '../../../../utils/findOwner';
import { formatDayHeading } from '../../../../utils/formatDayHeading';
import type { DayCellProps } from './types';

export const DayCell = ({ date, inMonth, isToday, isSelected, events, onSelect }: DayCellProps) => {
  const hidden = events.length - MAX_CHIPS_PER_DAY;
  return (
    <button
      type="button"
      aria-label={formatDayHeading({ date })}
      aria-pressed={isSelected}
      onClick={() => onSelect(date)}
      className={`flex min-h-20 cursor-pointer flex-col items-stretch gap-0.5 bg-background p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-focus aria-pressed:bg-default ${inMonth ? '' : 'opacity-40'}`}
    >
      <span
        className={`flex size-6 items-center justify-center self-start rounded-full text-xs font-semibold ${isToday ? 'bg-accent text-white' : ''}`}
      >
        {Number(date.slice(8))}
      </span>
      {events.slice(0, MAX_CHIPS_PER_DAY).map((event) => {
        const { color } = findOwner({ ownerId: event.ownerId });
        return (
          <span
            key={event.id}
            className={`truncate rounded px-1 text-[10px] leading-4 ${SHOP_COLOR_CLASSES[color]} ${SHOP_TEXT_CLASSES[color]}`}
          >
            {event.title}
          </span>
        );
      })}
      {hidden > 0 && (
        <span className="px-1 text-[10px] opacity-60">
          +{hidden} {CALENDAR_COPY.moreSuffix}
        </span>
      )}
    </button>
  );
};
