# Lambda kit

Code shared by two or more Lambdas under `apps/functions/` (DynamoDB keys, request helpers, the configuration loader). Every Lambda that imports from here is rebuilt and redeployed when anything in this package changes, so code used by a single Lambda belongs in that Lambda's own `src/utils/`.

Import by file path, for example `@fridgeboard/lambda-kit/utils/keys/profileKey/index.ts`. There is no barrel; `package.json` exposes every file under `src/`.
