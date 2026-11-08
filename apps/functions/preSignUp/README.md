# preSignUp

The `fridgeboard-pre-sign-up` Lambda (pre-sign-up). Deployed by `.github/workflows/functions.yml` only when this package, `@fridgeboard/lambda-kit` or `@fridgeboard/contract` changes.

| Command | What it does |
|---|---|
| `pnpm build` | Bundles `src/index.ts` to `dist/index.mjs` (override esbuild options in `build.config.ts`) |
| `pnpm smoke` | Imports the built bundle |
| `pnpm test` | Unit tests |

`.deployment` holds the deployed function name; it must match the name in `local.functions` in `terraform-cloud-infra`.
