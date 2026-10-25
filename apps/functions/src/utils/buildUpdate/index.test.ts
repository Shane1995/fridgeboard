import { buildUpdate } from './index.ts';

describe('buildUpdate', () => {
  it('aliases every attribute so reserved words such as name and count are safe', () => {
    expect(buildUpdate({ set: { name: 'Milk', color: 'b1' }, add: { count: 1 } })).toEqual({
      UpdateExpression: 'SET #a0 = :v0, #a1 = :v1 ADD #a2 :v2',
      ExpressionAttributeNames: { '#a0': 'name', '#a1': 'color', '#a2': 'count' },
      ExpressionAttributeValues: { ':v0': 'Milk', ':v1': 'b1', ':v2': 1 },
    });
  });

  it('leaves out a clause with nothing in it', () => {
    expect(buildUpdate({ set: { checked: true } }).UpdateExpression).toBe('SET #a0 = :v0');
  });
});
