import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEPLOYMENT_FILE, DEPLOYMENT_NAME, LAMBDA_KINDS } from '../constants.ts';

const readKind = (directory: string): unknown => {
  const manifest: { lambda?: { kind?: unknown } } = JSON.parse(
    readFileSync(join(directory, 'package.json'), 'utf8'),
  );

  return manifest.lambda?.kind;
};

export const findDeploymentErrors = (root: string): string[] => {
  const lambdas = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'package.json')))
    .map((entry) => entry.name);
  const names = lambdas.map((lambda) => {
    const file = join(root, lambda, DEPLOYMENT_FILE);
    return existsSync(file) ? readFileSync(file, 'utf8').trim() : '';
  });

  return lambdas.flatMap((lambda, index) => {
    const name = names[index] ?? '';
    const kind = readKind(join(root, lambda));

    return [
      ...(DEPLOYMENT_NAME.test(name)
        ? []
        : [`${lambda}: ${DEPLOYMENT_FILE} must hold a name like fridgeboard-my-lambda`]),
      ...(name !== '' && names.indexOf(name) !== index
        ? [`${lambda}: ${name} is already used by another Lambda`]
        : []),
      ...(LAMBDA_KINDS.some((allowed) => allowed === kind)
        ? []
        : [`${lambda}: package.json lambda.kind must be one of ${LAMBDA_KINDS.join(', ')}`]),
    ];
  });
};
