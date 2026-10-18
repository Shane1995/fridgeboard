import { pickKey } from './index.ts';

describe('pickKey', () => {
  it('keeps only PK and SK', () => {
    expect(pickKey({ PK: 'USER#u1', SK: 'PROFILE', name: 'Jess' })).toEqual({
      PK: 'USER#u1',
      SK: 'PROFILE',
    });
  });
});
