import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LAMBDAS_DIR, USAGE } from './constants.ts';

describe('new-lambda', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scaffold-'));

  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(process, 'cwd').mockReturnValue(dir);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    rmSync(join(dir, LAMBDAS_DIR), { recursive: true, force: true });
    mkdirSync(join(dir, LAMBDAS_DIR), { recursive: true });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('creates the Lambda folder with its deployment name and a starter handler', async () => {
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'new-lambda', 'listItems']);

    await import('./index.ts');

    const target = join(dir, LAMBDAS_DIR, 'listItems');
    expect(readFileSync(join(target, '.deployment'), 'utf8')).toBe('fridgeboard-list-items\n');
    expect(existsSync(join(target, 'src/index.ts'))).toBe(true);
  });

  it('refuses to overwrite an existing Lambda', async () => {
    mkdirSync(join(dir, LAMBDAS_DIR, 'me'), { recursive: true });
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'new-lambda', 'me']);

    await expect(import('./index.ts')).rejects.toThrow('already exists');
  });

  it('prints the usage for a bad name', async () => {
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'new-lambda', 'Bad-Name']);

    await expect(import('./index.ts')).rejects.toThrow(USAGE);
  });
});
