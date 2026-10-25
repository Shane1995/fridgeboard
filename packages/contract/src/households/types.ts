export type HouseholdRole = 'owner' | 'member';

export type IHouseholdSummary = { id: string; name: string; role: HouseholdRole };

export type IHouseholdsResponse = { households: IHouseholdSummary[] };

export type ICreateHouseholdRequest = { name: string };

export type ICreateHouseholdResponse = IHouseholdSummary;

export type ICreateHouseholdErrorResponse = {
  reason: 'invalid-name' | 'not-allowed' | 'household-exists';
};

export type IHouseholdMember = { id: string; username?: string; role: HouseholdRole };

export type IHouseholdMembersResponse = { members: IHouseholdMember[] };

export type IInviteRequest = { email: string };

export type IInviteResponse = { email: string; verified: boolean };

export type IInviteErrorResponse = {
  reason:
    | 'invalid-email'
    | 'not-found'
    | 'limit-reached'
    | 'already-invited'
    | 'verification-failed';
};
