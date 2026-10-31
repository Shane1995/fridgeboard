import type { S3Client } from '@aws-sdk/client-s3';
import type { SQSClient } from '@aws-sdk/client-sqs';
import type { SSMClient } from '@aws-sdk/client-ssm';

export type BootstrapClients = {
  sqs: SQSClient;
  ssm: SSMClient;
  s3: S3Client;
};
