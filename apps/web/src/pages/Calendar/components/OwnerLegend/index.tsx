import { ShopSwatch } from '../../../../components/ShopSwatch';
import { CALENDAR_COPY } from '../../constants';
import { useOwners } from '../../hooks/useOwners';

export const OwnerLegend = () => {
  const owners = useOwners();
  return (
    <ul aria-label={CALENDAR_COPY.legendLabel} className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {owners.map((member) => (
        <li key={member.id} className="flex items-center gap-1.5">
          <ShopSwatch color={member.color} size="sm" />
          {member.name}
        </li>
      ))}
    </ul>
  );
};
