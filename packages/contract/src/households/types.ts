export type HouseholdRole = 'owner' | 'member';

export type IHouseholdSummary = { id: string; name: string; role: HouseholdRole };

export type IHouseholdsResponse = { households: IHouseholdSummary[] };

export type ICreateHouseholdRequest = { name: string };

export type ICreateHouseholdResponse = IHouseholdSummary;

export type ICreateHouseholdErrorResponse = {
  reason: 'invalid-name' | 'not-allowed' | 'household-exists';
};
