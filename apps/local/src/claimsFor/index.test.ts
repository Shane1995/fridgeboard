import { ADMIN_EMAIL } from '../constants.ts';
import { claimsFor } from './index.ts';

describe('claimsFor', () => {
  it('puts only the admin email in the admin group', () => {
    expect(claimsFor(ADMIN_EMAIL).groups).toEqual(['admin']);
    expect(claimsFor('member@fridgeboard.local').groups).toEqual([]);
  });
});
