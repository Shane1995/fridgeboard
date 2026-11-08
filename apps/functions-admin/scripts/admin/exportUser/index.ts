import { parseArgs } from '../utils/parseArgs/index.ts';
import { runCli } from '../utils/runCli/index.ts';
import { runExportUser } from '../utils/runExportUser/index.ts';

await runCli(async () => {
  const { email } = parseArgs(process.argv.slice(2));
  console.log(await runExportUser(email, process.cwd()));
});
