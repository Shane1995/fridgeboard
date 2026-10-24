import { useMembersQuery } from '../useMembersQuery';
import type { UseMemberNameOptions } from './types';

export const useMemberName = ({ id }: UseMemberNameOptions): string | undefined => {
  const { data } = useMembersQuery();
  return data?.members.find((member) => member.id === id)?.username;
};
