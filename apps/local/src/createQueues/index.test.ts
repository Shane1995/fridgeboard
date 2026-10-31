import { CreateQueueCommand, GetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
import { createQueues } from './index.ts';

const sqsMock = mockClient(SQSClient);

describe('createQueues', () => {
  beforeEach(() => {
    sqsMock.reset();
    sqsMock.on(CreateQueueCommand).resolves({ QueueUrl: 'http://q/dlq' });
    sqsMock
      .on(GetQueueAttributesCommand)
      .resolves({ Attributes: { QueueArn: 'arn:aws:sqs:eu-west-2:0:dlq' } });
  });

  it('creates the dead letter queue then the main queue redriving to it', async () => {
    await createQueues({ sqs: new SQSClient({}) });

    const [dlq, main] = sqsMock.commandCalls(CreateQueueCommand);
    expect(dlq?.args[0].input.QueueName).toBe('fridgeboard-recipe-import-dlq');
    expect(main?.args[0].input).toEqual({
      QueueName: 'fridgeboard-recipe-import',
      Attributes: {
        RedrivePolicy: JSON.stringify({
          deadLetterTargetArn: 'arn:aws:sqs:eu-west-2:0:dlq',
          maxReceiveCount: 3,
        }),
      },
    });
  });
});
