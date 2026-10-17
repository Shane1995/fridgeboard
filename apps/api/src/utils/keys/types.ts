export type TableKey = { PK: string; SK: string };

export type Invite = {
  type: 'app' | 'household';
  hhId?: string;
  admin?: boolean;
  invitedBy: string;
  expiresAt: number;
  ttl: number;
};
