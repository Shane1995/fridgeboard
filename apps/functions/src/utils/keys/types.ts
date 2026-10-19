export type TableKey = { PK: string; SK: string };

export type Invite = {
  type: 'app' | 'household';
  hhId?: string;
  admin?: boolean;
  invitedBy: string;
  expiresAt: number;
  ttl: number;
};
export type GsiKey = { GSI1PK: string };
export type MembershipKey = TableKey & { GSI1PK: string; GSI1SK: string };
