export type InviteOptions = {
  email: string;
  app: boolean;
  admin: boolean;
  household: string | undefined;
  now: number;
};

export type InviteResult = { link: string; identity: 'created' | 'recreated' | 'verified' };
