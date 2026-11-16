import { toggleWeekday } from '.';

describe('toggleWeekday', () => {
  it('adds a weekday and keeps them in week order', () => {
    expect(toggleWeekday({ weekdays: [4], day: 1 })).toEqual([1, 4]);
  });

  it('takes a weekday off', () => {
    expect(toggleWeekday({ weekdays: [1, 4], day: 1 })).toEqual([4]);
  });

  it('never takes off the last weekday', () => {
    expect(toggleWeekday({ weekdays: [4], day: 4 })).toEqual([4]);
  });
});
