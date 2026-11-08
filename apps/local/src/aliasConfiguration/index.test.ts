import { resolve } from 'node:path';
import type { Plugin, PluginBuild } from 'esbuild';
import { aliasConfiguration } from './index.ts';
import {
  FUNCTIONS_CONFIGURATION,
  FUNCTIONS_CONFIGURATION_SPECIFIER,
  LOCAL_CONFIGURATION,
} from './constants.ts';

const resolver = () => {
  const registered: { callback?: Parameters<PluginBuild['onResolve']>[1] } = {};
  const build = {
    onResolve: (_options: unknown, callback: Parameters<PluginBuild['onResolve']>[1]) => {
      registered.callback = callback;
    },
  } as unknown as PluginBuild;
  (aliasConfiguration as Plugin).setup(build);
  return (path: string, resolveDir: string) =>
    registered.callback?.({ path, resolveDir } as Parameters<PluginBuild['onResolve']>[1] extends (
      args: infer Args,
    ) => unknown
      ? Args
      : never);
};

describe('aliasConfiguration', () => {
  it('points the functions configuration module at the local one', () => {
    const resolveImport = resolver();

    expect(
      resolveImport(
        '../../configuration/index.ts',
        resolve(FUNCTIONS_CONFIGURATION, '../../utils/x'),
      ),
    ).toEqual({ path: LOCAL_CONFIGURATION });
  });

  it('points the package import of the functions configuration at the local one', () => {
    const resolveImport = resolver();

    expect(resolveImport(FUNCTIONS_CONFIGURATION_SPECIFIER, '/anywhere')).toEqual({
      path: LOCAL_CONFIGURATION,
    });
  });

  it('leaves other configuration modules alone', () => {
    const resolveImport = resolver();

    expect(resolveImport('./configuration/index.ts', '/somewhere/else')).toBeUndefined();
  });
});
