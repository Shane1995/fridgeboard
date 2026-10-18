import { parseInviteArgs } from '../utils/parseInviteArgs/index.ts';
import { runCli } from '../utils/runCli/index.ts';
import { runInvite } from '../utils/runInvite/index.ts';

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
  console.log(
    'Next: send them the link. If the identity is new or re-created, they must first tap',
  );
  console.log('the verification link in the email from Amazon Web Services (SES sandbox).');
});
