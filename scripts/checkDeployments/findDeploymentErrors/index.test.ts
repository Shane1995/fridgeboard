import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findDeploymentErrors } from './index.ts';

describe('findDeploymentErrors', () => {
  let root = '';

  const lambda = (name: string, deployment: string | null, kind: string | null) => {
    mkdirSync(join(root, name), { recursive: true });
    writeFileSync(
      join(root, name, 'package.json'),
      JSON.stringify(kind === null ? {} : { lambda: { kind } }),
    );
    if (deployment !== null) {
      writeFileSync(join(root, name, '.deployment'), `${deployment}\n`);
    }
  };

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'deployments-'));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('accepts a valid Lambda', () => {
    lambda('listItems', 'fridgeboard-list-items', 'wrapped');

    expect(findDeploymentErrors(root)).toEqual([]);
  });

  it('flags a missing deployment file', () => {
    lambda('me', null, 'wrapped');

    expect(findDeploymentErrors(root)).toEqual([
      'me: .deployment must hold a name like fridgeboard-my-lambda',
    ]);
  });

  it('flags a name without the fridgeboard prefix', () => {
    lambda('me', 'me', 'wrapped');

    expect(findDeploymentErrors(root)).toHaveLength(1);
  });

  it('flags a name used twice, once for the second Lambda', () => {
    lambda('a', 'fridgeboard-x', 'wrapped');
    lambda('b', 'fridgeboard-x', 'wrapped');

    expect(findDeploymentErrors(root)).toEqual(['b: fridgeboard-x is already used by another Lambda']);
  });

  it('flags an unknown kind', () => {
    lambda('me', 'fridgeboard-me', 'cron');

    expect(findDeploymentErrors(root)).toEqual([
      'me: package.json lambda.kind must be one of wrapped, pre-sign-up, post-confirmation, subscribe-guard',
    ]);
  });

  it('flags a missing kind', () => {
    lambda('me', 'fridgeboard-me', null);

    expect(findDeploymentErrors(root)).toHaveLength(1);
  });

  it('ignores folders that are not packages', () => {
    mkdirSync(join(root, 'dist'));

    expect(findDeploymentErrors(root)).toEqual([]);
  });
});
