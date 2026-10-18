import { parseInviteArgs } from '../utils/parseInviteArgs/index.ts';
import { runCli } from '../utils/runCli/index.ts';
import { runInvite } from '../utils/runInvite/index.ts';
import { NEXT_STEP_MESSAGE, VERIFY_MESSAGE } from './constants.ts';

await runCli(async () => {
  const { email, app, admin, household } = parseInviteArgs(process.argv.slice(2));
  const { link, identity } = await runInvite({
    email,
    app,
    admin,
    household,
    now: Math.floor(Date.now() / 1000),
  });
  console.log(`Invite written for ${email} (SES identity: ${identity}).`);
  console.log(`Join link: ${link}`);
  console.log(NEXT_STEP_MESSAGE);
  console.log(VERIFY_MESSAGE);
});
