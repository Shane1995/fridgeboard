import { buildDeletePlan } from './index.ts';

const userItems = [
  { PK: 'USER#u1', SK: 'PROFILE' },
  { PK: 'USER#u1', SK: 'PREF#x' },
];
const memberships = [
  { PK: 'HH#h1', SK: 'MEMBER#u1' },
  { PK: 'HH#h2', SK: 'MEMBER#u1' },
];

const invite = { PK: 'INVITE#a@b.co', SK: 'INVITE' };

describe('buildDeletePlan', () => {
  it('deletes user items and memberships of households that keep other members', () => {
    const plan = buildDeletePlan({
      sub: 'u1',
      email: ' A@B.co',
      userItems,
      memberships,
      householdMembers: { h1: ['MEMBER#u1', 'MEMBER#u2'], h2: ['MEMBER#u1', 'MEMBER#u3'] },
    });
    expect(plan).toEqual({ keys: [...userItems, ...memberships, invite], emptyHouseholds: [] });
  });

  it('wipes households where the user is the only member', () => {
    const plan = buildDeletePlan({
      sub: 'u1',
      email: ' A@B.co',
      userItems,
      memberships,
      householdMembers: { h1: ['MEMBER#u1', 'MEMBER#u2'], h2: ['MEMBER#u1'] },
    });
    expect(plan).toEqual({ keys: [...userItems, memberships[0], invite], emptyHouseholds: ['h2'] });
  });

  it('treats a household with no member rows as empty', () => {
    const plan = buildDeletePlan({
      sub: 'u1',
      email: ' A@B.co',
      userItems: [],
      memberships,
      householdMembers: {},
    });
    expect(plan.emptyHouseholds).toEqual(['h1', 'h2']);
  });

  it('ignores items without string keys or non-household partitions', () => {
    const plan = buildDeletePlan({
      sub: 'u1',
      email: ' A@B.co',
      userItems: [{ PK: 'USER#u1' }],
      memberships: [{ PK: 'X#1', SK: 'MEMBER#u1' }],
      householdMembers: {},
    });
    expect(plan).toEqual({ keys: [invite], emptyHouseholds: [] });
  });

  it('only treats GSI rows whose SK is MEMBER#<sub> as memberships', () => {
    const plan = buildDeletePlan({
      sub: 'u1',
      email: 'a@b.co',
      userItems: [],
      memberships: [{ PK: 'HH#h1', SK: 'MEMBER#other' }],
      householdMembers: {},
    });
    expect(plan).toEqual({ keys: [invite], emptyHouseholds: [] });
  });
});
