import type { IEvent } from '@fridgeboard/contract/events';
import type { HouseholdScope } from '../../utils/resolveHousehold/types.ts';
import type { Table } from '../../utils/table/types.ts';

export type QueryEventsOptions = {
  table: Table;
  scope: HouseholdScope;
  from: string;
  to: string;
};

export type GetEventOptions = {
  table: Table;
  scope: HouseholdScope;
  startDate: string;
  eventId: string;
};

export type PutEventOpOptions = { scope: HouseholdScope; event: IEvent };

export type DeleteEventOpOptions = { scope: HouseholdScope; startDate: string; eventId: string };
