import { HOUSEHOLD_OWNER } from '../../constants';
import { findOwner } from '.';

describe('findOwner', () => {
  it('finds a member by id', () => {
    expect(findOwner({ ownerId: 'shane' }).name).toBe('Shane');
  });

  it('falls back to the household for an unknown id', () => {
    expect(findOwner({ ownerId: 'nobody' })).toBe(HOUSEHOLD_OWNER);
  });
});
