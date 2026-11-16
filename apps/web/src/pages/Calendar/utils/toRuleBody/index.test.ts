import { ShopColor } from '../../../../services/shoppingList/constants';
import type { EventDraft } from '../../types';
import { toRuleBody } from '.';

const draft: EventDraft = {
  title: ' General waste ',
  allDay: true,
  date: '2026-11-05',
  startTime: '09:00',
  endTime: '10:00',
  ownerId: 'household',
  note: '',
  repeat: { frequency: 'weekly', interval: 2, weekdays: [4] },
};

describe('toRuleBody', () => {
  it('builds a bin-day rule: all day, every two weeks on Thursday', () => {
    expect(toRuleBody({ draft })).toEqual({
      title: 'General waste',
      note: '',
      ownerId: 'household',
      color: null,
      reminder: null,
      allDay: true,
      startDate: '2026-11-05',
      frequency: 'weekly',
      interval: 2,
      weekdays: [4],
    });
  });

  it('carries the colour and reminder', () => {
    expect(
      toRuleBody({ draft: { ...draft, color: ShopColor.Black, reminder: 360 } }),
    ).toMatchObject({ color: 'black', reminder: 360 });
  });

  it('sends London start and end times for a timed rule', () => {
    expect(
      toRuleBody({ draft: { ...draft, allDay: false, startTime: '18:00', endTime: '02:00' } }),
    ).toMatchObject({ allDay: false, startTime: '18:00', endTime: '02:00' });
  });

  it('leaves the times out of an all-day rule', () => {
    const body = toRuleBody({ draft });

    expect(body).not.toHaveProperty('startTime');
    expect(body).not.toHaveProperty('endTime');
  });

  it.each(['daily', 'monthly'] as const)('leaves the weekdays out of a %s rule', (frequency) => {
    const body = toRuleBody({
      draft: { ...draft, repeat: { frequency, interval: 1, weekdays: [4] } },
    });

    expect(body).toMatchObject({ frequency, interval: 1 });
    expect(body).not.toHaveProperty('weekdays');
  });

  it('ends the rule on the until date when there is one', () => {
    expect(
      toRuleBody({
        draft: {
          ...draft,
          repeat: { frequency: 'daily', interval: 1, weekdays: [], until: '2027-01-01' },
        },
      }),
    ).toMatchObject({ until: '2027-01-01' });
  });

  it('keeps the rule open-ended when there is no until date', () => {
    expect(toRuleBody({ draft })).not.toHaveProperty('until');
  });

  it('refuses a draft that does not repeat', () => {
    const { repeat: _removed, ...single } = draft;

    expect(() => toRuleBody({ draft: single })).toThrow();
  });
});
