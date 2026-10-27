import { HOUSEHOLD_OWNER, OWNER_OPTIONS } from '../../constants';
import type { CalendarMember } from '../../types';
import type { FindOwnerOptions } from './types';

export const findOwner = ({ ownerId }: FindOwnerOptions): CalendarMember =>
  OWNER_OPTIONS.find((member) => member.id === ownerId) ?? HOUSEHOLD_OWNER;
