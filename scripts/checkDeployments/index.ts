import { DEPLOYMENT_ERROR, LAMBDAS_ROOT } from './constants.ts';
import { findDeploymentErrors } from './findDeploymentErrors/index.ts';

const errors = findDeploymentErrors(LAMBDAS_ROOT);

if (errors.length > 0) {
  console.error(`${DEPLOYMENT_ERROR}\n${errors.join('\n')}`);
  process.exitCode = 1;
}
