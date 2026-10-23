import { findUnsortedKeys } from './index.ts';

describe('findUnsortedKeys', () => {
  it('returns nothing for sorted keys at every depth', () => {
    expect(findUnsortedKeys({ a: { b: 1, c: 2 }, d: [{ x: 1, y: 2 }] })).toEqual([]);
  });

  it('reports the path of an unsorted object', () => {
    expect(findUnsortedKeys({ b: 1, a: 2 })).toEqual(['$: keys are not sorted']);
  });

  it('reports nested and array-contained objects', () => {
    expect(findUnsortedKeys({ a: { z: 1, y: 2 }, l: [{ q: 1, p: 2 }] })).toEqual([
      '$.a: keys are not sorted',
      '$.l.0: keys are not sorted',
    ]);
  });

  it('ignores primitives', () => {
    expect(findUnsortedKeys('x')).toEqual([]);
    expect(findUnsortedKeys(null)).toEqual([]);
  });
});
