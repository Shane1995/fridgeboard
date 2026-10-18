export type Key = Record<string, unknown>;

export type DeletePlanInput = {
  sub: string;
  userItems: Key[];
  memberships: Key[];
  householdMembers: Record<string, string[]>;
};

export type DeletePlan = { keys: Key[]; emptyHouseholds: string[] };
