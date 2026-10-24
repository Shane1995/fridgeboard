import { useHouseholdsQuery } from '../useHouseholdsQuery';

export const useActiveHousehold = (): string | undefined => {
  const { data } = useHouseholdsQuery();
  return data?.households[0]?.id;
};
