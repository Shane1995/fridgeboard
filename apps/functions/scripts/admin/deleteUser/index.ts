import { confirmDeletion } from '../utils/confirmDeletion/index.ts';
import { parseArgs } from '../utils/parseArgs/index.ts';
import { promptUser } from '../utils/promptUser/index.ts';
import { runCli } from '../utils/runCli/index.ts';
import { runDeleteUser } from '../utils/runDeleteUser/index.ts';

await runCli(async () => {
  const { email, yes } = parseArgs(process.argv.slice(2));
  if (!yes && !(await confirmDeletion(email, (question) => promptUser(question)))) {
    console.log('Email did not match. Nothing deleted.');
    process.exitCode = 1;
    return;
  }
  const { households } = await runDeleteUser(email);
  console.log(`Deleted ${email} (${households} empty household(s) removed).`);
});
