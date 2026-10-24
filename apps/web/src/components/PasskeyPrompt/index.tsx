import { Alert, Button, Card } from '@heroui/react';
import { Typography } from '../Typography';
import { TypographyVariant } from '../Typography/constants';
import { PASSKEY_PROMPT_COPY as COPY } from './constants';
import { usePasskeyPrompt } from './hooks/usePasskeyPrompt';

export const PasskeyPrompt = () => {
  const { visible, done, message, isPending, handleSetUp, handleNotNow, handleDontAsk } =
    usePasskeyPrompt();

  if (!visible) {
    return null;
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {done ? (
        <Alert status="success">
          <Alert.Content>
            <Alert.Description>{COPY.done}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : (
        <Card>
          <Card.Content className="flex flex-col gap-3">
            <Typography variant={TypographyVariant.Heading3} as="h2">
              {COPY.title}
            </Typography>
            <Typography>{COPY.body}</Typography>
            {message && (
              <Alert status="danger">
                <Alert.Content>
                  <Alert.Description>{message}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
            <Button onPress={handleSetUp} isPending={isPending}>
              {isPending ? COPY.settingUp : COPY.setUp}
            </Button>
            <Button variant="secondary" onPress={handleNotNow}>
              {COPY.notNow}
            </Button>
            <Button variant="ghost" onPress={handleDontAsk}>
              {COPY.dontAsk}
            </Button>
          </Card.Content>
        </Card>
      )}
    </aside>
  );
};
