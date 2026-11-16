import { HOUSEHOLD_OWNER } from '../../constants';
import type { CalendarMember } from '../../types';
import type { FindOwnerOptions } from './types';

export const findOwner = ({ ownerId, owners }: FindOwnerOptions): CalendarMember =>
  owners.find((member) => member.id === ownerId) ?? HOUSEHOLD_OWNER;
