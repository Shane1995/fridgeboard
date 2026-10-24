import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { Alert, Button, Card } from '@heroui/react';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState } from 'react';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { useMeQuery } from '../../hooks/useMeQuery';
import { usePasskeyDevice } from '../../hooks/usePasskeyDevice';
import { useRegisterPasskeyMutation } from '../../hooks/useRegisterPasskeyMutation';
import { useSessionContext } from '../../hooks/useSessionContext';
import { FailureReason } from '../../services/session/constants';
import { SIGN_IN_COPY } from '../../pages/SignIn/constants';
import { CONFIRMATION_MS, PASSKEY_PROMPT_COPY as COPY } from './constants';

export const PasskeyPrompt = () => {
  const enabled = useFeatureFlag(WebFeatureFlag.ENABLE_PASSKEYS);
  const { recentCodeSignIn } = useSessionContext();
  const { data: me } = useMeQuery();
  const device = usePasskeyDevice();
  const register = useRegisterPasskeyMutation();
  const [hidden, setHidden] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const email = me?.email;
  const eligible =
    enabled &&
    recentCodeSignIn &&
    email !== undefined &&
    !device.promptDismissed &&
    device.email !== email &&
    browserSupportsWebAuthn();

  if (hidden || (!eligible && !done)) {
    return null;
  }

  const handleSetUp = () => {
    setMessage(undefined);
    register.mutate(undefined, {
      onSuccess: (result) => {
        if (result.ok) {
          if (email !== undefined) {
            device.remember(email);
          }
          setDone(true);
          setTimeout(() => setHidden(true), CONFIRMATION_MS);
        } else if (result.reason === FailureReason.Cancelled) {
          setMessage(COPY.cancelled);
        } else {
          setMessage(SIGN_IN_COPY.reasons[result.reason]);
        }
      },
      onError: () => setMessage(SIGN_IN_COPY.reasons.unknown),
    });
  };

  const handleDontAsk = () => {
    device.dismissPrompt();
    setHidden(true);
  };

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
            <h2 className="text-lg font-semibold">{COPY.title}</h2>
            <p>{COPY.body}</p>
            {message && (
              <Alert status="danger">
                <Alert.Content>
                  <Alert.Description>{message}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
            <Button onPress={handleSetUp} isPending={register.isPending}>
              {register.isPending ? COPY.settingUp : COPY.setUp}
            </Button>
            <Button variant="secondary" onPress={() => setHidden(true)}>
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
