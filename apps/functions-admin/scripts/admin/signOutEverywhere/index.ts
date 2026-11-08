import { parseArgs } from '../utils/parseArgs/index.ts';
import { runCli } from '../utils/runCli/index.ts';
import { runSignOutEverywhere } from '../utils/runSignOutEverywhere/index.ts';

await runCli(async () => {
  const { email } = parseArgs(process.argv.slice(2));
  await runSignOutEverywhere(email);
  console.log(`Signed out ${email} everywhere.`);
});
