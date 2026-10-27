import { ShopSwatch } from '../../../../components/ShopSwatch';
import { findOwner } from '../../utils/findOwner';
import { formatEventTime } from '../../utils/formatEventTime';
import type { EventRowProps } from './types';

export const EventRow = ({ event, onEdit }: EventRowProps) => {
  const owner = findOwner({ ownerId: event.ownerId });
  return (
    <button
      type="button"
      onClick={() => onEdit(event)}
      className="flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left outline-none hover:bg-default focus-visible:ring-2 focus-visible:ring-focus"
    >
      <span className="mt-1">
        <ShopSwatch color={owner.color} size="md" name={owner.name} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold">{event.title}</span>
        <span className="text-xs opacity-60">
          {formatEventTime({ event })} · {owner.name}
        </span>
        {event.note !== '' && <span className="truncate text-sm opacity-80">{event.note}</span>}
      </span>
    </button>
  );
};
