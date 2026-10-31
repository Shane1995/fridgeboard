import { BucketAlreadyOwnedByYou, CreateBucketCommand, type S3Client } from '@aws-sdk/client-s3';
import { CONFIG_BUCKET } from '../bootstrap/constants.ts';
import { REGION } from '../constants.ts';

export const createBucket = async ({ s3 }: { s3: S3Client }): Promise<void> => {
  try {
    await s3.send(
      new CreateBucketCommand({
        Bucket: CONFIG_BUCKET,
        CreateBucketConfiguration: { LocationConstraint: REGION },
      }),
    );
  } catch (error) {
    if (!(error instanceof BucketAlreadyOwnedByYou)) {
      throw error;
    }
  }
};
