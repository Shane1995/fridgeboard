import { Alert, Button } from '@heroui/react';
import { JOIN_COPY } from '../../constants';
import type { InstallHintProps } from './types';

export const InstallHint = ({ onDismiss }: InstallHintProps) => {
  return (
    <Alert status="accent">
      <Alert.Content>
        <Alert.Description>{JOIN_COPY.hint}</Alert.Description>
        <Button size="sm" variant="secondary" onPress={onDismiss}>
          {JOIN_COPY.dismiss}
        </Button>
      </Alert.Content>
    </Alert>
  );
};
