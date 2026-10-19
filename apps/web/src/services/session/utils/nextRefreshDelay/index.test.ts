import { nextRefreshDelay } from './index';

describe('nextRefreshDelay', () => {
  it('schedules the lead time before expiry', () => {
    expect(nextRefreshDelay(900, 60_000, 60_000)).toBe(840_000);
  });

  it('floors the delay at the minimum interval when expiry is within the lead time', () => {
    expect(nextRefreshDelay(30, 60_000, 60_000)).toBe(60_000);
  });

  it('never returns a zero delay when the lead exceeds the lifetime', () => {
    expect(nextRefreshDelay(0, 300_000, 120_000)).toBe(120_000);
  });
});
