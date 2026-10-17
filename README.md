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

| Command | What it does |
|---|---|
| `pnpm dev` | Run the web app with hot reload |
| `pnpm build` | Typecheck and build every app |
| `pnpm test` | Run Vitest |
| `pnpm lint` | Run oxlint |
| `pnpm typecheck` | Run `tsc -b` |
| `pnpm format` | Format with oxfmt |

## Layout

```
apps/web/            PWA
  src/App/           root component
  src/screens/<Name> one folder per screen
```

Each unit lives at `<Name>/index.tsx`, with its `types.ts`, `constants.ts` and `index.test.tsx` beside it.

## Contributing

`main` is protected, so all changes go through a pull request. Commits follow [Conventional Commits](https://www.conventionalcommits.org). The pre-commit hook formats, lints, typechecks and checks for dead code.

## Licence

Copyright © 2026 Shane Linden. All rights reserved. The source is public to read, but no licence is granted to copy, modify or reuse it. See [LICENSE](LICENSE).

To report a security issue, see [SECURITY.md](SECURITY.md).
