export type ICreateHouseholdRequest = { name: string };

export type ICreateHouseholdResponse = { id: string; name: string; role: 'owner' };

export type ICreateHouseholdErrorResponse = {
  reason: 'invalid-name' | 'not-allowed' | 'household-exists';
};
