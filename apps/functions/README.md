# Functions

The Fridgeboard API Lambdas, one package per folder (`apps/functions/<name>/`). Shared code lives in `packages/lambda-kit`, build and scaffold commands in `packages/lambda-tooling`, operator scripts in `apps/functions-admin`.

A push to `main` deploys only the Lambdas whose package, or a package they depend on, changed (`.github/workflows/functions.yml`). A change to `lambda-kit` or `contract` redeploys every Lambda that imports them.

Add a Lambda with `pnpm new:lambda <name> [kind]`.
