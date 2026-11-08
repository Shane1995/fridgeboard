import { renderStarter } from './index.ts';

describe('renderStarter', () => {
  it('writes a handler and its test', () => {
    expect(Object.keys(renderStarter())).toEqual(['src/index.ts', 'src/index.test.ts']);
  });
});
