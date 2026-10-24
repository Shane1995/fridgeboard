# Fridgeboard

A shared shopping list and shift planner for the household, replacing the calendar on the fridge. It's an installable PWA (Add to Home Screen) backed by serverless AWS.

## Stack

- **App:** React 19, TypeScript 7, Vite 8, HeroUI v3 on Tailwind CSS 4, `vite-plugin-pwa`
- **Tooling:** pnpm workspaces, Turborepo, Vitest, oxlint + oxfmt, Husky + commitlint, fallow
- **Hosting (planned):** S3 + CloudFront, Cognito, API Gateway + Lambda, DynamoDB in `eu-west-2`. DNS is on Cloudflare. Infra lives in a separate Terraform repo.

## Getting started

Requires Node 24+ and pnpm 9.

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

## Scripts

| Command                                           | What it does                                            |
| ------------------------------------------------- | ------------------------------------------------------- |
| `pnpm dev`                                        | Run the web app with hot reload                         |
| `pnpm dev:local`                                  | Web app + local API on DynamoDB Local (needs Docker)    |
| `pnpm dev:local:reset`                            | Delete the local DynamoDB data; the next run reseeds    |
| `pnpm build`                                      | Typecheck and build every app                           |
| `pnpm test`                                       | Run Vitest                                              |
| `pnpm --filter @fridgeboard/e2e test:integration` | Run handler tests against DynamoDB Local (needs Docker) |
| `pnpm lint`                                       | Run oxlint                                              |
| `pnpm typecheck`                                  | Run `tsc -b`                                            |
| `pnpm format`                                     | Format with oxfmt                                       |

## Layout

```
apps/web/            PWA
  src/app/           framework wiring: router, route tree, devtools
  src/components/    reusable UI, including the root App
  src/hooks/         React hooks
  src/pages/<Name>   one folder per page
  src/routes/        TanStack file routes (thin)
  src/services/      framework-agnostic I/O (no React or UI-framework imports)
  src/utils/         pure helpers
```

Each unit lives at `<Name>/index.tsx`, with its `types.ts`, `constants.ts` and `index.test.tsx` beside it.

See the Web layout section in `.claude/CODE_STANDARDS.md` for the full folder table.

## Contributing

`main` is protected, so all changes go through a pull request. Commits follow [Conventional Commits](https://www.conventionalcommits.org). The pre-commit hook formats, lints, typechecks and checks for dead code.

## Local app (Docker)

`pnpm dev:local` starts DynamoDB Local (data kept in a Docker volume), the real `me`, `username` and `households` Lambdas behind `http://127.0.0.1:3001`, and Vite on `http://localhost:5173` proxying `/api` and `/configuration.json` to it.

Sign in with any seeded email and code `000000`:

| Email                        | What it is                                            |
| ---------------------------- | ----------------------------------------------------- |
| `admin@fridgeboard.local`    | Admin with a username and the household "Local Home"  |
| `member@fridgeboard.local`   | Household invite: joins "Local Home" on first sign-in |
| `newcomer@fridgeboard.local` | App invite: may create a household                    |

Passkeys are off and their routes 404. `pnpm dev:local:reset` deletes the data; the next run reseeds. Stop DynamoDB Local with `docker compose stop dynamodb-dev`.

## Licence

Copyright © 2026 Shane Linden. All rights reserved. The source is public to read, but no licence is granted to copy, modify or reuse it. See [LICENSE](LICENSE).

To report a security issue, see [SECURITY.md](SECURITY.md).
