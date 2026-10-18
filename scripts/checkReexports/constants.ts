export const ROOTS = ['apps', 'packages'];
export const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', 'coverage']);
export const SKIPPED_FILE = 'routeTree.gen.ts';
export const SOURCE_FILE = /\.(ts|tsx)$/;
export const REEXPORT = /^\s*export\s+(?:type\s+)?(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s/m;
export const REEXPORT_ERROR = 'Re-exports are not allowed (import from the source file):';
