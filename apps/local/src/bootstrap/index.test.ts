import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { CreateQueueCommand, GetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs';
import { PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { bootstrap } from './index.ts';

const sqsMock = mockClient(SQSClient);
const ssmMock = mockClient(SSMClient);
const s3Mock = mockClient(S3Client);

describe('bootstrap', () => {
  it('provisions the queues, parameters and bucket', async () => {
    sqsMock.on(CreateQueueCommand).resolves({ QueueUrl: 'http://q' });
    sqsMock.on(GetQueueAttributesCommand).resolves({ Attributes: { QueueArn: 'arn' } });
    ssmMock.on(PutParameterCommand).resolves({});
    s3Mock.on(CreateBucketCommand).resolves({});

    await bootstrap({ sqs: new SQSClient({}), ssm: new SSMClient({}), s3: new S3Client({}) });

    expect(sqsMock.commandCalls(CreateQueueCommand)).toHaveLength(2);
    expect(ssmMock.commandCalls(PutParameterCommand)).toHaveLength(1);
    expect(s3Mock.commandCalls(CreateBucketCommand)).toHaveLength(1);
  });
});
