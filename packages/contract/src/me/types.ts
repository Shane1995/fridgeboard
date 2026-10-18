export type IMeResponse = {
  sub: string;
  email: string;
  isAdmin: boolean;
  canCreateHousehold: boolean;
  households: { id: string; name: string; role: string }[];
};
