import { createBucket } from '../createBucket/index.ts';
import { createQueues } from '../createQueues/index.ts';
import { putParameters } from '../putParameters/index.ts';
import type { BootstrapClients } from './types.ts';

export const bootstrap = async ({ sqs, ssm, s3 }: BootstrapClients): Promise<void> => {
  await createQueues({ sqs });
  await putParameters({ ssm });
  await createBucket({ s3 });
};
