import { useMembersQuery } from '../useMembersQuery';
import type { UseMemberNameOptions } from './types';

export const useMemberName = ({ id, enabled }: UseMemberNameOptions): string | undefined => {
  const { data } = useMembersQuery({ enabled });
  return data?.members.find((member) => member.id === id)?.username;
};
