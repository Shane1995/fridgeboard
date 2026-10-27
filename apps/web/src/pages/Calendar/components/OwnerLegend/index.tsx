import { ShopSwatch } from '../../../../components/ShopSwatch';
import { CALENDAR_COPY, OWNER_OPTIONS } from '../../constants';

export const OwnerLegend = () => {
  return (
    <ul aria-label={CALENDAR_COPY.legendLabel} className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {OWNER_OPTIONS.map((member) => (
        <li key={member.id} className="flex items-center gap-1.5">
          <ShopSwatch color={member.color} size="sm" />
          {member.name}
        </li>
      ))}
    </ul>
  );
};
