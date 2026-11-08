import { buildInvite } from './index.ts';

const base = {
  email: ' Jess@Example.com ',
  app: false,
  admin: false,
  invitedBy: 'admin',
  now: 1000,
};

describe('buildInvite', () => {
  it('normalises the email into the key', () => {
    expect(buildInvite(base)).toMatchObject({ PK: 'INVITE#jess@example.com', SK: 'INVITE' });
  });

  it('expires seven days after now and mirrors it in ttl', () => {
    expect(buildInvite(base)).toMatchObject({ expiresAt: 1000 + 604800, ttl: 1000 + 604800 });
  });

  it('is an app invite only with app set', () => {
    expect(buildInvite({ ...base, app: true }).type).toBe('app');
    expect(buildInvite(base).type).toBe('household');
  });

  it('sets admin only when requested', () => {
    expect(buildInvite({ ...base, admin: true }).admin).toBe(true);
    expect(buildInvite(base)).not.toHaveProperty('admin');
  });

  it('records who invited', () => {
    expect(buildInvite(base).invitedBy).toBe('admin');
  });

  it('sets hhId from household', () => {
    expect(buildInvite({ ...base, household: 'h1' })).toMatchObject({
      type: 'household',
      hhId: 'h1',
    });
    expect(buildInvite(base)).not.toHaveProperty('hhId');
  });
});
