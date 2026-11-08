import { USAGE } from '../constants.ts';
import { parseScaffoldArgs } from './index.ts';

describe('parseScaffoldArgs', () => {
  it('defaults the kind to wrapped', () => {
    expect(parseScaffoldArgs(['listItems'])).toEqual({ name: 'listItems', kind: 'wrapped' });
  });

  it('accepts a known kind', () => {
    expect(parseScaffoldArgs(['preSignUp', 'pre-sign-up'])).toEqual({
      name: 'preSignUp',
      kind: 'pre-sign-up',
    });
  });

  it.each([[[]], [['List-Items']], [['ListItems']], [['listItems', 'cron']]])(
    'rejects %j',
    (argv) => {
      expect(() => parseScaffoldArgs(argv)).toThrow(USAGE);
    },
  );
});
