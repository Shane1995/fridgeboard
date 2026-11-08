import type { BuildOptions } from 'esbuild';

export type BuildConfig = Omit<BuildOptions, 'entryPoints' | 'outfile' | 'outdir'>;
