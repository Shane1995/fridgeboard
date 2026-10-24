export type IMeResponse = {
  sub: string;
  email: string;
  username: string | null;
  isAdmin: boolean;
  canCreateHousehold: boolean;
  hasOnboarding: boolean;
};
