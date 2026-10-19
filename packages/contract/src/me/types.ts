export type IMeResponse = {
  sub: string;
  email: string;
  username: string | null;
  isAdmin: boolean;
  canCreateHousehold: boolean;
  households: { id: string; name: string; role: string }[];
};
