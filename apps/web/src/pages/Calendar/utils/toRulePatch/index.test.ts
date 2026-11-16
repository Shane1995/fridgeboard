import { ShopColor } from '../../../../services/shoppingList/constants';
import type { EventDraft } from '../../types';
import { toRulePatch } from '.';

const draft: EventDraft = {
  title: ' Recycling ',
  allDay: false,
  date: '2026-11-12',
  startTime: '07:00',
  endTime: '08:00',
  ownerId: 'sub-1',
  note: ' blue bin ',
  color: ShopColor.Sky,
  reminder: 60,
};

describe('toRulePatch', () => {
  it('changes what every occurrence shares, and nothing about when the series starts or repeats', () => {
    expect(toRulePatch({ draft })).toEqual({
      title: 'Recycling',
      note: 'blue bin',
      ownerId: 'sub-1',
      color: 'sky',
      reminder: 60,
      allDay: false,
      startTime: '07:00',
      endTime: '08:00',
    });
  });

  it('clears a colour and reminder the draft no longer has', () => {
    const { color: _color, reminder: _reminder, ...plain } = draft;

    expect(toRulePatch({ draft: plain })).toMatchObject({ color: null, reminder: null });
  });

  it('leaves the times out of an all-day change', () => {
    expect(toRulePatch({ draft: { ...draft, allDay: true } })).toEqual({
      title: 'Recycling',
      note: 'blue bin',
      ownerId: 'sub-1',
      color: 'sky',
      reminder: 60,
      allDay: true,
    });
  });
});
