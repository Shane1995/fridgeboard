import { buildDummyPlanner } from '.';

describe('buildDummyPlanner', () => {
  it('starts the week on the chosen day', () => {
    expect(buildDummyPlanner({ weekStartsOn: 0 }).days[0]?.title).toBe('Sunday');
    expect(buildDummyPlanner({ weekStartsOn: 1 }).days[0]?.title).toBe('Monday');
    expect(buildDummyPlanner({ weekStartsOn: 1 }).days[6]?.title).toBe('Sunday');
  });

  it('gives every section and line a unique id', () => {
    const plan = buildDummyPlanner({ weekStartsOn: 0 });
    const ids = [...plan.days, ...plan.notes].flatMap((section) => [
      section.id,
      ...section.lines.map((line) => line.id),
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
