# Local

Runs the real API handlers and the web app on your machine. LocalStack stands in for AWS (DynamoDB, SQS, SSM, S3) and auth is faked.

## Run

1. Docker Desktop running.
2. `apps/local/.env` containing `LOCALSTACK_AUTH_TOKEN=<token>` (gitignored), or export it in your shell.
3. `pnpm dev:local` from the repo root.

| What       | Where                                                            |
| ---------- | ---------------------------------------------------------------- |
| Web app    | http://localhost:5173 (proxies `/api` and `/configuration.json`) |
| API        | http://127.0.0.1:3001                                            |
| LocalStack | http://127.0.0.1:4566                                            |

`Ctrl+C` stops the API and Vite; the LocalStack container keeps running with its data. `pnpm dev:local:reset` removes the container, and the next run rebuilds and reseeds everything.

## Sign in

Auth is faked: the code is always `000000`. Only an email with a profile or an invite can sign in; any other email gets `403 no-invite`.

| Email                        | Use it to test                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `admin@fridgeboard.local`    | Admin (`isAdmin: true`), username `admin`, owns "Local Home" with seeded lists        |
| `member@fridgeboard.local`   | Household invite: first sign-in joins "Local Home" (onboarding, then the shared list) |
| `newcomer@fridgeboard.local` | App invite: first sign-in has no household and may create one                         |

Invite page: http://localhost:5173/join#email=member@fridgeboard.local

## Test a new user flow

Invites are single-use in effect: once someone has signed in, they have a profile. To run a first-sign-in flow again, run `pnpm dev:local:reset` and start again.

To test a brand new person, invite them as the admin, then sign in as them:

1. Sign in as `admin@fridgeboard.local` and take the `accessToken` (see below).
2. `POST /api/v1/households/local-household/invites` with `{"email":"friend@fridgeboard.local"}` and the bearer token.
3. Sign in as `friend@fridgeboard.local` with `000000`.

Locally this invite call answers `502 {"reason":"verification-failed"}` because there is no SES, but the invite is saved and the person can sign in.

Admin-only app invites (`ENABLE_ADMIN_INVITES`) and passkeys are not available locally.

## Use Postman or curl

Import `apps/local/postman/fridgeboard-local.postman_collection.json` into Postman. Run Auth > Request code, then Verify code (saves the access token), and the rest work. Change the `email` variable to sign in as someone else. The "Live sync" folder has a local publish request and a production one.

Or by hand:

Hit the API directly on port 3001.

1. `POST /api/v1/auth/start` with `{"email":"admin@fridgeboard.local"}` returns 204 and sets a cookie (Postman keeps it).
2. `POST /api/v1/auth/verify` with `{"code":"000000"}` returns `{"accessToken":"local.…","expiresIn":3600}`.
3. Send `Authorization: Bearer <accessToken>` on every other request. Without it you get 401.

```sh
curl -s -X POST http://127.0.0.1:3001/api/v1/auth/start -c jar -H 'content-type: application/json' -d '{"email":"admin@fridgeboard.local"}'
curl -s -X POST http://127.0.0.1:3001/api/v1/auth/verify -b jar -c jar -H 'content-type: application/json' -d '{"code":"000000"}'
curl -s http://127.0.0.1:3001/api/v1/me -H 'Authorization: Bearer <accessToken>'
```

The route paths are in http://127.0.0.1:3001/configuration.json. Routes served locally are listed in `src/route/index.ts`; to add one, add one entry and restart.

## Live sync

Open the app in two tabs signed in to the same household: adding, ticking or deleting an item in one shows up in the other without a reload. This uses a local stand-in for AppSync Events that runs inside the API server:

- The handlers' real `publishChange` posts to `http://127.0.0.1:3001/event`.
- Browsers connect to `ws://127.0.0.1:3001/event/realtime`, speaking the same protocol as production (`connection_init`, `subscribe`, `data`, keep-alives).
- Only household members can subscribe, like the production `subscribe_guard`.
- Signatures, Cognito and AppSync limits are not checked.

You can publish by hand with the "Publish change (local)" request in the Postman collection.

## Configuration

`dev:local` uses its own copies of the app configuration, so you can change flags and settings here before they go to production:

| File                                   | Used for                                       |
| -------------------------------------- | ---------------------------------------------- |
| `apps/local/configuration/web.json`    | Served as `/configuration.json` to the web app |
| `apps/local/configuration/lambda.json` | Read by the handlers instead of the S3 config  |

They are copies of `apps/configuration/web/configuration.json` and `apps/configuration/lambda/configuration.json` with three local changes: passkeys off, and the live-sync hosts pointing at `127.0.0.1:3001`. Edits are picked up without a restart. A test fails if the local copies drift from production (different flags, settings, endpoints or services), so update both when you add one.

## Look at the data

`pnpm db:admin` opens a table browser (dynamodb-admin) for LocalStack's DynamoDB at http://localhost:8001. The LocalStack web app at https://app.localstack.cloud also shows resources for the running container (sign in with your LocalStack account).

```sh
export AWS_ENDPOINT_URL=http://127.0.0.1:4566 AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local AWS_REGION=eu-west-2
aws dynamodb scan --table-name fridgeboard
aws sqs list-queues
aws ssm get-parameters-by-path --path /fridgeboard
aws s3 ls
```

## What is faked

Cognito, the JWT authorizer, API Gateway, SES, Bedrock and AppSync are not available (Cognito, Bedrock and AppSync are not on the LocalStack Community licence), and credentials are dummy, so IAM is not checked. AppSync is replaced by the local stand-in described above. Anything touching those only shows up after a deploy.

## Troubleshooting

- `Add LOCALSTACK_AUTH_TOKEN=<token> to apps/local/.env`: the token is missing.
- Port 3001, 5173 or 4566 in use: an earlier `dev:local` or LocalStack is still running.
- Docker not found: `DOCKER_HOST` must point at Docker Desktop's socket (`unix:///Users/shane/.docker/run/docker.sock`).
- The `Route file ... does not export a Route` warnings from Vite are harmless.
