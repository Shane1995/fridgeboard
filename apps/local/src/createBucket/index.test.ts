import { BucketAlreadyOwnedByYou, CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { createBucket } from './index.ts';

const s3Mock = mockClient(S3Client);

describe('createBucket', () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  it('creates the config bucket in eu-west-2', async () => {
    s3Mock.on(CreateBucketCommand).resolves({});

    await createBucket({ s3: new S3Client({}) });

    expect(s3Mock.commandCalls(CreateBucketCommand)[0]?.args[0].input).toEqual({
      Bucket: 'fridgeboard-config-local',
      CreateBucketConfiguration: { LocationConstraint: 'eu-west-2' },
    });
  });

  it('keeps an existing bucket', async () => {
    s3Mock
      .on(CreateBucketCommand)
      .rejects(new BucketAlreadyOwnedByYou({ message: 'exists', $metadata: {} }));

    await expect(createBucket({ s3: new S3Client({}) })).resolves.toBeUndefined();
  });

  it('rethrows other errors', async () => {
    s3Mock.on(CreateBucketCommand).rejects(new Error('boom'));

    await expect(createBucket({ s3: new S3Client({}) })).rejects.toThrow('boom');
  });
});
