import { getProgress } from '.';

describe('getProgress', () => {
  const sections = [
    { id: 'username' as const, done: true },
    { id: 'household' as const, done: false },
  ];

  it('numbers the current step among the steps the user has', () => {
    expect(getProgress(sections, 'household')).toBe('Step 2 of 2');
    expect(getProgress([{ id: 'username', done: false }, sections[1]!], 'username')).toBe(
      'Step 1 of 2',
    );
  });

  it('shows nothing for a single step', () => {
    expect(getProgress([{ id: 'username', done: false }], 'username')).toBeUndefined();
  });

  it('shows nothing on the needs-invite screen', () => {
    expect(
      getProgress(
        [
          { id: 'username', done: true },
          { id: 'needs-invite', done: false },
        ],
        'needs-invite',
      ),
    ).toBeUndefined();
  });
});
