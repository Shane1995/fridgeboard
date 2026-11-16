import { HOUSEHOLD_OWNER, OWNER_OPTIONS } from '../../constants';
import { findOwner } from '.';

describe('findOwner', () => {
  it('finds a member by id', () => {
    expect(findOwner({ ownerId: 'shane', owners: OWNER_OPTIONS }).name).toBe('Shane');
  });

  it('finds a member in the list it is given', () => {
    const owners = [HOUSEHOLD_OWNER, { id: 'sub-9', name: 'Jess', color: HOUSEHOLD_OWNER.color }];

    expect(findOwner({ ownerId: 'sub-9', owners }).name).toBe('Jess');
  });

  it('falls back to the household for an unknown id', () => {
    expect(findOwner({ ownerId: 'nobody', owners: OWNER_OPTIONS })).toBe(HOUSEHOLD_OWNER);
  });
});
