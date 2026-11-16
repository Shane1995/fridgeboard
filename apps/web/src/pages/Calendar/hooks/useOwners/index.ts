import { useMemo } from 'react';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { useMembersQuery } from '../../../../hooks/useMembersQuery';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { HOUSEHOLD_OWNER, MEMBER_COLORS, OWNER_OPTIONS, UNNAMED_MEMBER } from '../../constants';
import type { CalendarMember } from '../../types';

// Who an event can belong to. With the events API on that is the household plus its real members,
// coloured by their place in the id order so both phones show the same colours. Otherwise it is the
// local dummy list.
export const useOwners = (): readonly CalendarMember[] => {
  const useApi = useFeatureFlag(WebFeatureFlag.ENABLE_CALENDAR_API);
  const { data } = useMembersQuery({ enabled: useApi });
  return useMemo(() => {
    if (!useApi) {
      return OWNER_OPTIONS;
    }
    const members = [...(data?.members ?? [])].sort((left, right) =>
      left.id.localeCompare(right.id),
    );
    return [
      HOUSEHOLD_OWNER,
      ...members.map(({ id, username }, index): CalendarMember => ({
        id,
        name: username ?? UNNAMED_MEMBER,
        color: MEMBER_COLORS[index % MEMBER_COLORS.length] ?? HOUSEHOLD_OWNER.color,
      })),
    ];
  }, [useApi, data]);
};
