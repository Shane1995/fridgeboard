# Lambda tooling

Shared build, smoke and scaffold commands for the Lambda packages under `apps/functions/`.

| Command | What it does |
|---|---|
| `lambda-build` | Bundles `src/index.ts` to `dist/index.mjs` with esbuild. A `build.config.ts` in the Lambda exports `buildConfig` to override esbuild options. |
| `lambda-smoke` | Imports `dist/index.mjs` so a bundle that throws on load fails the check. |
| `new-lambda <name> [kind]` | Creates `apps/functions/<name>/` with every file a Lambda needs. `kind` is `wrapped` (default), `pre-sign-up`, `post-confirmation` or `subscribe-guard`. |

Run the scaffold from the repo root with `pnpm new:lambda <name> [kind]`.
