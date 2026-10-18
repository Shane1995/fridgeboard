import { createInterface } from 'node:readline/promises';
import { confirmDeletion } from '../utils/confirmDeletion/index.ts';
import { parseArgs } from '../utils/parseArgs/index.ts';
import { runCli } from '../utils/runCli/index.ts';
import { runDeleteUser } from '../utils/runDeleteUser/index.ts';

const promptUser = async (question: string): Promise<string> => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer;
};

await runCli(async () => {
  const { email, yes } = parseArgs(process.argv.slice(2));
  if (!yes && !(await confirmDeletion(email, promptUser))) {
    console.log('Email did not match. Nothing deleted.');
    process.exitCode = 1;
    return;
  }
  const { households } = await runDeleteUser(email);
  console.log(`Deleted ${email} (${households} empty household(s) removed).`);
});
