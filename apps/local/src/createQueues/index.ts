import { CreateQueueCommand, GetQueueAttributesCommand, type SQSClient } from '@aws-sdk/client-sqs';
import { DLQ_NAME, MAX_RECEIVE_COUNT, QUEUE_NAME } from '../bootstrap/constants.ts';

export const createQueues = async ({ sqs }: { sqs: SQSClient }): Promise<void> => {
  const { QueueUrl: dlqUrl } = await sqs.send(new CreateQueueCommand({ QueueName: DLQ_NAME }));
  const { Attributes } = await sqs.send(
    new GetQueueAttributesCommand({ QueueUrl: dlqUrl, AttributeNames: ['QueueArn'] }),
  );
  await sqs.send(
    new CreateQueueCommand({
      QueueName: QUEUE_NAME,
      Attributes: {
        RedrivePolicy: JSON.stringify({
          deadLetterTargetArn: Attributes?.['QueueArn'],
          maxReceiveCount: MAX_RECEIVE_COUNT,
        }),
      },
    }),
  );
};
