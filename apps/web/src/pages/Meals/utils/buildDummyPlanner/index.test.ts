import { buildDummyPlanner } from '.';

describe('buildDummyPlanner', () => {
  it('starts the week on the chosen day', () => {
    expect(buildDummyPlanner({ weekStartsOn: 0 }).days[0]?.title).toBe('Sunday');
    expect(buildDummyPlanner({ weekStartsOn: 1 }).days[0]?.title).toBe('Monday');
    expect(buildDummyPlanner({ weekStartsOn: 1 }).days[6]?.title).toBe('Sunday');
  });

  it('tags each day with its weekday number', () => {
    const days = buildDummyPlanner({ weekStartsOn: 1 }).days;
    expect(days.map((day) => day.weekday)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('links a couple of meals to mock recipes', () => {
    const lines = buildDummyPlanner({ weekStartsOn: 0 }).days.flatMap((day) => day.lines);
    expect(
      lines.filter((line) => line.recipeId !== undefined).map((line) => line.recipeId),
    ).toEqual(['mock-bolognese', 'mock-soup']);
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
