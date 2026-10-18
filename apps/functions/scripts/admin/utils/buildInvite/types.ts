export type BuildInviteInput = {
  email: string;
  app: boolean;
  admin: boolean;
  household?: string | undefined;
  invitedBy: string;
  now: number;
};
